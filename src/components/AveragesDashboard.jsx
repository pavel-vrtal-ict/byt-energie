import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatMoney, formatNumber, formatDate, formatDateShort } from '../utils/format'
import {
  getAverageConsumptionPerDay,
  getConsumptionRateSeries,
  getLatestIntervalRate,
  getLifetimeAveragePerDay,
} from '../data/consumption'
import './AveragesDashboard.css'

const PERIODS = [
  { key: 'day', label: 'Den', days: 1 },
  { key: 'week', label: 'Týden', days: 7 },
  { key: 'month', label: 'Měsíc', days: 30 },
  { key: 'year', label: 'Rok', days: 365 },
]

const PERIOD_BAR_OPACITY = { day: 1, week: 0.85, month: 0.7, year: 0.55 }

function PeriodTooltip({ active, payload, unit, decimals, pricePerUnit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  if (!p.ok) {
    return (
      <div className="dash-tooltip">
        <div className="dash-tooltip-label">{p.label}</div>
        <div className="dash-tooltip-na">Není dost dat pro toto období</div>
      </div>
    )
  }
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">
        {p.label}
        {p.isPartial && <span className="dash-tooltip-pill">jen {formatNumber(p.effectiveWindowDays, 0, 1)} dní dat</span>}
      </div>
      <div className="dash-tooltip-value">
        {formatNumber(p.perDay, decimals, decimals)} {unit}/den
      </div>
      <div className="dash-tooltip-detail">
        Za období: {formatNumber(p.totalInWindow, decimals, decimals)} {unit}
        {p.isPartial && ` (cíl ${p.days} dní)`}
      </div>
      <div className="dash-tooltip-detail">
        Náklady: {formatMoney(p.perDay * pricePerUnit)}/den · {formatMoney(p.totalInWindow * pricePerUnit)} celkem
      </div>
    </div>
  )
}

function RateTooltip({ active, payload, unit, decimals, pricePerUnit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">{p.label}</div>
      <div className="dash-tooltip-value">
        {formatNumber(p.ratePerDay, decimals, decimals)} {unit}/den
      </div>
      <div className="dash-tooltip-detail">
        Interval: {formatNumber(p.intervalDays, 0, 1)} dní ({p.prevLabel} → {p.label})
      </div>
      <div className="dash-tooltip-detail">{formatMoney(p.ratePerDay * pricePerUnit)}/den</div>
    </div>
  )
}

function HeadlineCard({ modifier, icon, name, unit, decimals, monthDecimals, pricePerUnit, latest, lifetime }) {
  if (!latest) {
    return (
      <article className={`dash-headline dash-headline-${modifier}`}>
        <header>
          <span className="dash-headline-icon">{icon}</span>
          <span className="dash-headline-name">{name}</span>
        </header>
        <p className="dash-empty">Přidejte výchozí stav a alespoň jeden odečet.</p>
      </article>
    )
  }

  const { ratePerDay, intervalDays, fromDate, toDate, totalConsumption } = latest
  const lifetimeRate = lifetime?.perDay ?? null
  const diffPct = lifetimeRate && lifetimeRate > 0 ? ((ratePerDay - lifetimeRate) / lifetimeRate) * 100 : null
  const trend = diffPct == null ? null : diffPct > 1 ? 'up' : diffPct < -1 ? 'down' : 'flat'
  const trendArrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '≈'
  const intervalDaysRounded = Math.round(intervalDays)

  return (
    <article className={`dash-headline dash-headline-${modifier}`}>
      <header>
        <span className="dash-headline-icon">{icon}</span>
        <span className="dash-headline-name">{name}</span>
        <span className="dash-headline-since">Od posledního odečtu</span>
      </header>
      <div className="dash-headline-value">
        <span className="dash-headline-num">{formatNumber(ratePerDay, decimals, decimals)}</span>
        <span className="dash-headline-unit">{unit} / den</span>
      </div>
      <div className="dash-headline-meta">
        {formatDate(fromDate)} → {formatDate(toDate)} · {intervalDaysRounded} {intervalDaysRounded === 1 ? 'den' : intervalDaysRounded < 5 ? 'dny' : 'dní'} · {formatNumber(totalConsumption, decimals, decimals)} {unit}
      </div>
      <div className="dash-headline-cost">
        {formatMoney(ratePerDay * pricePerUnit)} / den
        <span className="dash-headline-sep">·</span>
        ≈ {formatMoney(ratePerDay * pricePerUnit * 30)} / měsíc
      </div>
      {lifetimeRate != null && (
        <div className={`dash-headline-trend dash-trend-${trend}`}>
          <span className="dash-trend-arrow" aria-hidden="true">{trendArrow}</span>
          {trend === 'flat'
            ? 'Stejné jako dlouhodobý průměr'
            : `${diffPct > 0 ? '+' : ''}${formatNumber(diffPct, 0, 1)} % oproti dlouhodobému průměru (${formatNumber(lifetimeRate, decimals, decimals)} ${unit}/den)`}
        </div>
      )}
    </article>
  )
}

function ResourceCharts({
  title,
  icon,
  accentVar,
  unit,
  unitLong,
  decimals,
  pricePerUnit,
  periodData,
  rateSeries,
  emptyMessage,
}) {
  const hasAnyPeriodData = periodData.some((d) => d.ok)
  const hasRateData = rateSeries.length > 0

  return (
    <div className="dash-resource">
      <header className="dash-resource-head">
        <span className="dash-resource-icon" aria-hidden="true">
          {icon}
        </span>
        <h3 className="dash-resource-title">{title}</h3>
      </header>

      <div className="dash-charts">
        <div className="dash-chart-block">
          <div className="dash-chart-title">Průměr za období ({unit}/den)</div>
          {!hasAnyPeriodData ? (
            <p className="dash-empty">{emptyMessage}</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={periodData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<PeriodTooltip unit={unit} decimals={decimals} pricePerUnit={pricePerUnit} />}
                />
                <Bar dataKey="perDay" radius={[8, 8, 0, 0]}>
                  {periodData.map((d) => {
                    const baseOpacity = PERIOD_BAR_OPACITY[d.key] ?? 1
                    const fillOpacity = !d.ok ? 0.1 : d.isPartial ? Math.min(baseOpacity, 0.45) : baseOpacity
                    return <Cell key={d.key} fill={`var(${accentVar})`} fillOpacity={fillOpacity} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-chart-block">
          <div className="dash-chart-title">Vývoj denní spotřeby mezi odečty ({unit}/den)</div>
          {!hasRateData ? (
            <p className="dash-empty">Pro vykreslení vývoje potřebujeme alespoň dva odečty (nebo výchozí stav + odečet).</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rateSeries} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id={`grad-${unitLong}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`var(${accentVar})`} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={`var(${accentVar})`} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  cursor={{ stroke: 'var(--border)' }}
                  content={<RateTooltip unit={unit} decimals={decimals} pricePerUnit={pricePerUnit} />}
                />
                <Line
                  type="monotone"
                  dataKey="ratePerDay"
                  stroke={`var(${accentVar})`}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: `var(${accentVar})`, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export function AveragesDashboard({ data }) {
  const { electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater, initialDate } = data

  const elecPeriods = useMemo(() => {
    return PERIODS.map(({ key, label, days }) => {
      const r = getAverageConsumptionPerDay(electricity, initialElectricity, initialDate, days)
      return {
        key,
        label,
        days,
        perDay: r.hasEnoughData ? r.avgPerDay : 0,
        totalInWindow: r.totalInWindow,
        effectiveWindowDays: r.effectiveWindowDays,
        isPartial: r.isPartial,
        ok: r.hasEnoughData,
      }
    })
  }, [electricity, initialElectricity, initialDate])

  const waterPeriods = useMemo(() => {
    return PERIODS.map(({ key, label, days }) => {
      const r = getAverageConsumptionPerDay(water, initialWater, initialDate, days)
      return {
        key,
        label,
        days,
        perDay: r.hasEnoughData ? r.avgPerDay : 0,
        totalInWindow: r.totalInWindow,
        effectiveWindowDays: r.effectiveWindowDays,
        isPartial: r.isPartial,
        ok: r.hasEnoughData,
      }
    })
  }, [water, initialWater, initialDate])

  const elecRateSeries = useMemo(() => {
    const series = getConsumptionRateSeries(electricity, initialElectricity, initialDate)
    return series.map((p) => ({ ...p, label: formatDateShort(p.date), prevLabel: formatDateShort(p.prevDate) }))
  }, [electricity, initialElectricity, initialDate])

  const waterRateSeries = useMemo(() => {
    const series = getConsumptionRateSeries(water, initialWater, initialDate)
    return series.map((p) => ({ ...p, label: formatDateShort(p.date), prevLabel: formatDateShort(p.prevDate) }))
  }, [water, initialWater, initialDate])

  const elecLatest = useMemo(
    () => getLatestIntervalRate(electricity, initialElectricity, initialDate),
    [electricity, initialElectricity, initialDate]
  )
  const waterLatest = useMemo(
    () => getLatestIntervalRate(water, initialWater, initialDate),
    [water, initialWater, initialDate]
  )
  const elecLifetime = useMemo(
    () => getLifetimeAveragePerDay(electricity, initialElectricity, initialDate),
    [electricity, initialElectricity, initialDate]
  )
  const waterLifetime = useMemo(
    () => getLifetimeAveragePerDay(water, initialWater, initialDate),
    [water, initialWater, initialDate]
  )

  return (
    <section className="dash" aria-label="Přehled průměrné spotřeby">
      <div className="dash-headlines">
        <HeadlineCard
          modifier="electric"
          icon="⚡"
          name="Elektřina"
          unit="kWh"
          decimals={2}
          monthDecimals={1}
          pricePerUnit={pricePerKwh}
          latest={elecLatest}
          lifetime={elecLifetime}
        />
        <HeadlineCard
          modifier="water"
          icon="💧"
          name="Voda"
          unit="m³"
          decimals={3}
          monthDecimals={2}
          pricePerUnit={pricePerM3}
          latest={waterLatest}
          lifetime={waterLifetime}
        />
      </div>

      <ResourceCharts
        title="Elektřina"
        icon="⚡"
        accentVar="--accent-electric"
        unit="kWh"
        unitLong="kwh"
        decimals={2}
        pricePerUnit={pricePerKwh}
        periodData={elecPeriods}
        rateSeries={elecRateSeries}
        emptyMessage="Přidejte výchozí stav a alespoň jeden odečet, ať můžeme spočítat průměry."
      />

      <ResourceCharts
        title="Voda"
        icon="💧"
        accentVar="--accent-water"
        unit="m³"
        unitLong="m3"
        decimals={3}
        pricePerUnit={pricePerM3}
        periodData={waterPeriods}
        rateSeries={waterRateSeries}
        emptyMessage="Přidejte výchozí stav a alespoň jeden odečet, ať můžeme spočítat průměry."
      />

      <p className="dash-footnote">
        Spotřeba mezi odečty je rozpočítána do dnů a sečtena podle překryvu s daným oknem (Den / Týden / Měsíc / Rok).
        Pokud nemáte dost dat na celé okno, zkrátí se na skutečný rozsah – takové sloupce jsou světlejší a v tooltipu
        je uvedeno „jen X dní dat“.
      </p>
    </section>
  )
}
