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
import { formatMoney, formatNumber, formatDateShort } from '../utils/format'
import { getAverageConsumptionPerDay, getConsumptionRateSeries } from '../data/consumption'
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
      <div className="dash-tooltip-label">{p.label}</div>
      <div className="dash-tooltip-value">
        {formatNumber(p.perDay, decimals, decimals)} {unit}/den
      </div>
      <div className="dash-tooltip-detail">
        Za období: {formatNumber(p.totalInWindow, decimals, decimals)} {unit}
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
                  {periodData.map((d) => (
                    <Cell
                      key={d.key}
                      fill={`var(${accentVar})`}
                      fillOpacity={d.ok ? PERIOD_BAR_OPACITY[d.key] ?? 1 : 0.1}
                    />
                  ))}
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

  const headlineElec = elecPeriods[0].ok ? elecPeriods[0] : elecPeriods.find((p) => p.ok)
  const headlineWater = waterPeriods[0].ok ? waterPeriods[0] : waterPeriods.find((p) => p.ok)

  return (
    <section className="dash" aria-label="Přehled průměrné spotřeby">
      <div className="dash-headlines">
        <article className="dash-headline dash-headline-electric">
          <header>
            <span className="dash-headline-icon">⚡</span>
            <span className="dash-headline-name">Elektřina</span>
          </header>
          {headlineElec ? (
            <>
              <div className="dash-headline-value">
                <span className="dash-headline-num">{formatNumber(headlineElec.perDay, 1, 2)}</span>
                <span className="dash-headline-unit">kWh / den</span>
              </div>
              <div className="dash-headline-meta">
                ≈ {formatNumber(headlineElec.perDay * 30, 0, 1)} kWh / měsíc
              </div>
              <div className="dash-headline-cost">
                {formatMoney(headlineElec.perDay * pricePerKwh)} / den
                <span className="dash-headline-sep">·</span>
                {formatMoney(headlineElec.perDay * pricePerKwh * 30)} / měsíc
              </div>
              <div className="dash-headline-tag">Z období: {headlineElec.label.toLowerCase()}</div>
            </>
          ) : (
            <p className="dash-empty">Přidejte výchozí stav a alespoň jeden odečet.</p>
          )}
        </article>

        <article className="dash-headline dash-headline-water">
          <header>
            <span className="dash-headline-icon">💧</span>
            <span className="dash-headline-name">Voda</span>
          </header>
          {headlineWater ? (
            <>
              <div className="dash-headline-value">
                <span className="dash-headline-num">{formatNumber(headlineWater.perDay, 1, 3)}</span>
                <span className="dash-headline-unit">m³ / den</span>
              </div>
              <div className="dash-headline-meta">
                ≈ {formatNumber(headlineWater.perDay * 30, 1, 2)} m³ / měsíc
              </div>
              <div className="dash-headline-cost">
                {formatMoney(headlineWater.perDay * pricePerM3)} / den
                <span className="dash-headline-sep">·</span>
                {formatMoney(headlineWater.perDay * pricePerM3 * 30)} / měsíc
              </div>
              <div className="dash-headline-tag">Z období: {headlineWater.label.toLowerCase()}</div>
            </>
          ) : (
            <p className="dash-empty">Přidejte výchozí stav a alespoň jeden odečet.</p>
          )}
        </article>
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
        Tím je výsledek srovnatelný i při nepravidelných odečtech.
      </p>
    </section>
  )
}
