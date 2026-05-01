import { useMemo } from 'react'
import { formatMoney, formatNumber, formatDate } from '../utils/format'
import { getTotalConsumptionAndCost, getAverageConsumptionPerDay } from '../data/consumption'
import './SummaryCards.css'

export function SummaryCards({ data }) {
  const { electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater, initialDate } = data

  const summary = useMemo(() => {
    const elec = getTotalConsumptionAndCost(electricity, initialElectricity, pricePerKwh)
    const wat = getTotalConsumptionAndCost(water, initialWater, pricePerM3)
    const elec7 = getAverageConsumptionPerDay(electricity, initialElectricity, initialDate, 7)
    const elec30 = getAverageConsumptionPerDay(electricity, initialElectricity, initialDate, 30)
    const elec365 = getAverageConsumptionPerDay(electricity, initialElectricity, initialDate, 365)
    const wat7 = getAverageConsumptionPerDay(water, initialWater, initialDate, 7)
    const wat30 = getAverageConsumptionPerDay(water, initialWater, initialDate, 30)
    const wat365 = getAverageConsumptionPerDay(water, initialWater, initialDate, 365)
    return {
      totalKwh: elec.totalConsumption,
      totalM3: wat.totalConsumption,
      elecCost: elec.totalCost,
      waterCost: wat.totalCost,
      totalCost: elec.totalCost + wat.totalCost,
      avg: {
        elec: { d7: elec7.avgPerDay, d30: elec30.avgPerDay, d365: elec365.avgPerDay, ok: elec7.hasEnoughData || elec30.hasEnoughData || elec365.hasEnoughData },
        water: { d7: wat7.avgPerDay, d30: wat30.avgPerDay, d365: wat365.avgPerDay, ok: wat7.hasEnoughData || wat30.hasEnoughData || wat365.hasEnoughData },
      },
    }
  }, [electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater, initialDate])

  return (
    <section className="summary-cards" id="souhrn-prumery" aria-label="Souhrn spotřeby a průměry">
      <div className="card card-electric">
        <span className="card-icon">⚡</span>
        <div className="card-content">
          <span className="card-label">Elektřina</span>
          <span className="card-value">{formatMoney(summary.elecCost)}</span>
          <span className="card-detail">{formatNumber(summary.totalKwh, 1, 1)} kWh celkem</span>
          <div className="card-avg">
            <span className="card-avg-label">Průměr za posledních N dní (kWh/den)</span>
            <div className="card-avg-row">
              <span className="chip">
                <span className="chip-period">Týden</span> {formatNumber(summary.avg.elec.d7, 1, 2)}
              </span>
              <span className="chip">
                <span className="chip-period">Měsíc</span> {formatNumber(summary.avg.elec.d30, 1, 2)}
              </span>
              <span className="chip">
                <span className="chip-period">Rok</span> {formatNumber(summary.avg.elec.d365, 1, 2)}
              </span>
            </div>
          </div>
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
          <div className="card-avg">
            <span className="card-avg-label">Průměr za posledních N dní (m³/den)</span>
            <div className="card-avg-row">
              <span className="chip">
                <span className="chip-period">Týden</span> {formatNumber(summary.avg.water.d7, 1, 3)}
              </span>
              <span className="chip">
                <span className="chip-period">Měsíc</span> {formatNumber(summary.avg.water.d30, 1, 3)}
              </span>
              <span className="chip">
                <span className="chip-period">Rok</span> {formatNumber(summary.avg.water.d365, 1, 3)}
              </span>
            </div>
          </div>
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
