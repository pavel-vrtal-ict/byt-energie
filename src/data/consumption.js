/**
 * Výpočet spotřeby z odečtů (stavů měřidla).
 * Když je výchozí stav zadán: spotřeba = rozdíl mezi odečty (první odečet − výchozí stav, další − předchozí).
 * Když výchozí stav není: každý odečet se bere jako spotřeba za období (zpětná kompatibilita).
 */

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
