import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { useMemo } from 'react'
import { formatDateShort, formatNumber } from '../utils/format'
import { getConsumptionsWithEntries } from '../data/consumption'
import './ConsumptionCharts.css'

export function ConsumptionCharts({ electricity, water, initialElectricity, initialWater, initialDate }) {
  const electricData = useMemo(() => {
    const rows = getConsumptionsWithEntries(electricity, initialElectricity)
    const base = rows.map(({ entry, consumption }) => ({
      date: entry.date,
      label: formatDateShort(entry.date),
      kWh: Math.round(consumption * 100) / 100,
      note: entry.note,
    }))
    const hasInitial =
      initialElectricity != null &&
      !Number.isNaN(initialElectricity) &&
      initialDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(initialDate)

    if (!hasInitial) return base

    return [
      { date: initialDate, label: formatDateShort(initialDate), kWh: 0, note: 'Výchozí stav' },
      ...base,
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [electricity, initialElectricity, initialDate])

  const waterData = useMemo(() => {
    const rows = getConsumptionsWithEntries(water, initialWater)
    const base = rows.map(({ entry, consumption }) => ({
      date: entry.date,
      label: formatDateShort(entry.date),
      m3: Math.round(consumption * 100) / 100,
      note: entry.note,
    }))
    const hasInitial =
      initialWater != null &&
      !Number.isNaN(initialWater) &&
      initialDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(initialDate)

    if (!hasInitial) return base

    return [{ date: initialDate, label: formatDateShort(initialDate), m3: 0, note: 'Výchozí stav' }, ...base].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )
  }, [water, initialWater, initialDate])

  const CustomTooltip = ({ active, payload, unit, decimals = 1 }) => {
    if (!active || !payload?.length) return null
    const p = payload[0].payload
    const value = unit === 'kWh' ? p.kWh : p.m3
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-label">{p.label}</div>
        <div className="chart-tooltip-value">
          {formatNumber(value, decimals, decimals)} {unit}
        </div>
        {p.note && <div className="chart-tooltip-note">{p.note}</div>}
      </div>
    )
  }

  return (
    <div className="consumption-charts">
      <h2>Grafy spotřeby</h2>

      <div className="chart-block">
        <h3 className="chart-title">⚡ Elektřina – spotřeba (kWh)</h3>
        {electricData.length === 0 ? (
          <p className="chart-empty">Zatím žádné odečty. Přidejte první odečet elektřiny. Grafy zobrazují spotřebu (rozdíl mezi odečty).</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={electricData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradElectric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-electric)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent-electric)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip unit="kWh" />} />
              <Area
                type="monotone"
                dataKey="kWh"
                stroke="var(--accent-electric)"
                strokeWidth={2}
                fill="url(#gradElectric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-block">
        <h3 className="chart-title">💧 Voda – spotřeba (m³)</h3>
        {waterData.length === 0 ? (
          <p className="chart-empty">Zatím žádné odečty. Přidejte první odečet vody.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={waterData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-water)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent-water)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip unit="m³" decimals={2} />} />
              <Area
                type="monotone"
                dataKey="m3"
                stroke="var(--accent-water)"
                strokeWidth={2}
                fill="url(#gradWater)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
