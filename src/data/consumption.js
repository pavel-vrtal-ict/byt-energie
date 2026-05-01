/**
 * Výpočet spotřeby z odečtů (stavů měřidla).
 * Když je výchozí stav zadán: spotřeba = rozdíl mezi odečty (první odečet − výchozí stav, další − předchozí).
 * Když výchozí stav není: každý odečet se bere jako spotřeba za období (zpětná kompatibilita).
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseISODateLocal(iso) {
  if (!iso || typeof iso !== 'string') return null
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function toDateLocal(value) {
  if (value instanceof Date) return value
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) return parseISODateLocal(value) ?? new Date(value)
  return new Date(value)
}

function daysBetween(start, end) {
  const ms = end.getTime() - start.getTime()
  return ms / (24 * 60 * 60 * 1000)
}

/** Seřadí odečty podle data a vrátí pole { entry, consumption } */
export function getConsumptionsWithEntries(entries, initialValue) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sorted.length === 0) return []

  const hasInitial = initialValue != null && !Number.isNaN(initialValue)

  return sorted.map((entry, i) => {
    const consumption = hasInitial
      ? (i === 0 ? entry.value - initialValue : entry.value - sorted[i - 1].value)
      : entry.value
    const safeConsumption = Math.max(0, consumption)
    return { entry, consumption: safeConsumption }
  })
}

/** Celková spotřeba a náklady */
export function getTotalConsumptionAndCost(entries, initialValue, pricePerUnit) {
  const rows = getConsumptionsWithEntries(entries, initialValue)
  const totalConsumption = rows.reduce((sum, r) => sum + r.consumption, 0)
  const totalCost = rows.reduce((sum, r) => sum + r.consumption * pricePerUnit, 0)
  return { totalConsumption, totalCost, rows }
}

/**
 * Průměrná spotřeba za posledních N dní (kWh/m³ za den) podle vložených odečtů.
 * Spotřebu mezi dvěma datumy rozpočítá rovnoměrně do dnů a vezme pouze překryv s oknem.
 *
 * Důležité: pokud uživatel nemá `windowDays` dat, okno se zkrátí na skutečně dostupný rozsah,
 * abychom průměr nezředili nulami za "prázdné" dny. To se hlásí přes `effectiveWindowDays`
 * a `isPartial`.
 *
 * Vrací { avgPerDay, totalInWindow, windowDays, effectiveWindowDays, isPartial, hasEnoughData, asOfDate }
 */
export function getAverageConsumptionPerDay(entries, initialValue, initialDate, windowDays) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sorted.length === 0) {
    return {
      avgPerDay: 0,
      totalInWindow: 0,
      windowDays,
      effectiveWindowDays: 0,
      isPartial: true,
      hasEnoughData: false,
      asOfDate: null,
    }
  }

  const hasInitial =
    initialValue != null && !Number.isNaN(initialValue) && typeof initialDate === 'string' && ISO_DATE_RE.test(initialDate)

  const points = hasInitial
    ? [{ date: initialDate, value: Number(initialValue), isInitial: true }, ...sorted.map((e) => ({ date: e.date, value: e.value }))]
    : sorted.map((e) => ({ date: e.date, value: e.value }))

  if (points.length < 2) {
    const asOf = toDateLocal(points[0].date)
    return {
      avgPerDay: 0,
      totalInWindow: 0,
      windowDays,
      effectiveWindowDays: 0,
      isPartial: true,
      hasEnoughData: false,
      asOfDate: asOf,
    }
  }

  const firstDate = toDateLocal(points[0].date)
  const asOf = toDateLocal(points[points.length - 1].date)
  const dataSpanDays = daysBetween(firstDate, asOf)
  if (!(dataSpanDays > 0)) {
    return {
      avgPerDay: 0,
      totalInWindow: 0,
      windowDays,
      effectiveWindowDays: 0,
      isPartial: true,
      hasEnoughData: false,
      asOfDate: asOf,
    }
  }

  const effectiveWindowDays = Math.min(windowDays, dataSpanDays)
  const windowEnd = asOf
  const windowStart = new Date(windowEnd.getTime() - effectiveWindowDays * 24 * 60 * 60 * 1000)

  let total = 0
  let hadAnyInterval = false

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const intervalStart = toDateLocal(prev.date)
    const intervalEnd = toDateLocal(cur.date)
    const intervalDays = daysBetween(intervalStart, intervalEnd)
    if (!(intervalDays > 0)) continue

    const rawConsumption = hasInitial ? Number(cur.value) - Number(prev.value) : Number(cur.value)
    const intervalConsumption = Math.max(0, rawConsumption)

    const overlapStart = intervalStart > windowStart ? intervalStart : windowStart
    const overlapEnd = intervalEnd < windowEnd ? intervalEnd : windowEnd
    const overlapDays = daysBetween(overlapStart, overlapEnd)
    if (!(overlapDays > 0)) continue

    hadAnyInterval = true
    total += intervalConsumption * (overlapDays / intervalDays)
  }

  const avgPerDay = hadAnyInterval ? total / effectiveWindowDays : 0
  return {
    avgPerDay,
    totalInWindow: total,
    windowDays,
    effectiveWindowDays,
    isPartial: effectiveWindowDays < windowDays,
    hasEnoughData: hadAnyInterval,
    asOfDate: asOf,
  }
}

/**
 * Rychlost spotřeby od posledního odečtu (jednotek za den) na základě posledních dvou bodů.
 * Vrací null, pokud nejsou aspoň dva (výchozí stav + první odečet, nebo dva odečty).
 *
 * { ratePerDay, intervalDays, fromDate, toDate, totalConsumption }
 */
export function getLatestIntervalRate(entries, initialValue, initialDate) {
  const series = getConsumptionRateSeries(entries, initialValue, initialDate)
  if (series.length === 0) return null
  const last = series[series.length - 1]
  return {
    ratePerDay: last.ratePerDay,
    intervalDays: last.intervalDays,
    fromDate: last.prevDate,
    toDate: last.date,
    totalConsumption: last.ratePerDay * last.intervalDays,
  }
}

/**
 * Lifetime (celkový) průměr za den napříč všemi vloženými intervaly.
 * Spočítá se jako součet spotřeb / součet dní intervalů (vážený průměr).
 */
export function getLifetimeAveragePerDay(entries, initialValue, initialDate) {
  const series = getConsumptionRateSeries(entries, initialValue, initialDate)
  if (series.length === 0) return null
  let totalConsumption = 0
  let totalDays = 0
  for (const p of series) {
    totalConsumption += p.ratePerDay * p.intervalDays
    totalDays += p.intervalDays
  }
  if (!(totalDays > 0)) return null
  return {
    perDay: totalConsumption / totalDays,
    totalDays,
    totalConsumption,
  }
}

/**
 * Vrátí pole bodů { date, label, ratePerDay, intervalDays, prevDate } popisujících rychlost
 * spotřeby (jednotek za den) v intervalu mezi předchozím a aktuálním odečtem.
 *
 * Tohle je smysluplné i u nepravidelných odečtů, protože y-osa je už normalizovaná na den.
 *
 * - S výchozím stavem: první bod je za interval výchozí datum → první odečet.
 * - Bez výchozího stavu: první odečet bere jako spotřebu „od minulého období“ a interval
 *   mu dopočítá až další odečet (proto první bod vynecháme; přidá se až od druhého odečtu).
 */
export function getConsumptionRateSeries(entries, initialValue, initialDate) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sorted.length === 0) return []

  const hasInitial =
    initialValue != null &&
    !Number.isNaN(initialValue) &&
    typeof initialDate === 'string' &&
    ISO_DATE_RE.test(initialDate)

  const points = hasInitial
    ? [{ date: initialDate, value: Number(initialValue) }, ...sorted.map((e) => ({ date: e.date, value: e.value }))]
    : sorted.map((e) => ({ date: e.date, value: e.value }))

  const result = []
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const start = toDateLocal(prev.date)
    const end = toDateLocal(cur.date)
    const intervalDays = daysBetween(start, end)
    if (!(intervalDays > 0)) continue

    const consumption = hasInitial ? Number(cur.value) - Number(prev.value) : Number(cur.value)
    const safe = Math.max(0, consumption)
    result.push({
      date: cur.date,
      prevDate: prev.date,
      ratePerDay: safe / intervalDays,
      intervalDays,
    })
  }
  return result
}
