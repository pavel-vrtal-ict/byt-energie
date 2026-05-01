import { useMemo } from 'react'
import { formatMoney, formatNumber, formatDate } from '../utils/format'
import { getTotalConsumptionAndCost } from '../data/consumption'
import './SummaryCards.css'

export function SummaryCards({ data }) {
  const { electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater, initialDate } = data

  const summary = useMemo(() => {
    const elec = getTotalConsumptionAndCost(electricity, initialElectricity, pricePerKwh)
    const wat = getTotalConsumptionAndCost(water, initialWater, pricePerM3)
    return {
      totalKwh: elec.totalConsumption,
      totalM3: wat.totalConsumption,
      elecCost: elec.totalCost,
      waterCost: wat.totalCost,
      totalCost: elec.totalCost + wat.totalCost,
    }
  }, [electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater])

  return (
    <section className="summary-cards" aria-label="Souhrn spotřeby">
      <div className="card card-electric">
        <span className="card-icon">⚡</span>
        <div className="card-content">
          <span className="card-label">Elektřina</span>
          <span className="card-value">{formatMoney(summary.elecCost)}</span>
          <span className="card-detail">{formatNumber(summary.totalKwh, 1, 1)} kWh celkem</span>
          {initialElectricity != null && (
            <span className="card-initial">
              Výchozí stav: {formatNumber(initialElectricity, 0, 2)} kWh
              {initialDate && ` (${formatDate(initialDate)})`}
            </span>
          )}
        </div>
      </div>
      <div className="card card-water">
        <span className="card-icon">💧</span>
        <div className="card-content">
          <span className="card-label">Voda</span>
          <span className="card-value">{formatMoney(summary.waterCost)}</span>
          <span className="card-detail">{formatNumber(summary.totalM3, 1, 1)} m³ celkem</span>
          {initialWater != null && (
            <span className="card-initial">
              Výchozí stav: {formatNumber(initialWater, 0, 2)} m³
              {initialDate && ` (${formatDate(initialDate)})`}
            </span>
          )}
        </div>
      </div>
      <div className="card card-total">
        <span className="card-icon">📊</span>
        <div className="card-content">
          <span className="card-label">Celkem náklady</span>
          <span className="card-value card-value-total">{formatMoney(summary.totalCost)}</span>
        </div>
      </div>
    </section>
  )
}
