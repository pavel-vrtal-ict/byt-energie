import { useMemo, useState, useEffect, useCallback } from 'react'
import { PriceSettings } from './PriceSettings'
import { formatMoney, formatNumber } from '../utils/format'
import { getAverageConsumptionPerDay } from '../data/consumption'
import './FloatingPricePanel.css'

const PERIODS = [
  { key: 'day', label: 'Den', days: 1 },
  { key: 'week', label: 'Týden', days: 7 },
  { key: 'month', label: 'Měsíc', days: 30 },
  { key: 'year', label: 'Rok', days: 365 },
]

export function FloatingPricePanel({ data, onSavePrices }) {
  const [open, setOpen] = useState(false)
  const { electricity, water, pricePerKwh, pricePerM3, initialElectricity, initialWater, initialDate } = data

  const rows = useMemo(() => {
    return PERIODS.map(({ key, label, days }) => {
      const e = getAverageConsumptionPerDay(electricity, initialElectricity, initialDate, days)
      const w = getAverageConsumptionPerDay(water, initialWater, initialDate, days)
      return {
        key,
        label,
        elecKwhPerDay: e.avgPerDay,
        elecOk: e.hasEnoughData,
        waterM3PerDay: w.avgPerDay,
        waterOk: w.hasEnoughData,
      }
    })
  }, [electricity, water, initialElectricity, initialWater, initialDate])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (ev) => {
      if (ev.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <div className="floating-price-root">
      {!open && (
        <button type="button" className="floating-price-fab" onClick={() => setOpen(true)} aria-expanded={false}>
          Ceny a průměry
        </button>
      )}

      {open && (
        <>
          <button type="button" className="floating-price-backdrop" aria-label="Zavřít" onClick={close} />
          <div className="floating-price-sheet" role="dialog" aria-modal="true" aria-labelledby="floating-price-title">
            <div className="floating-price-sheet-head">
              <h2 id="floating-price-title" className="floating-price-sheet-title">
                Ceny a průměry
              </h2>
              <button type="button" className="floating-price-close" onClick={close} aria-label="Zavřít">
                ✕
              </button>
            </div>
            <div className="floating-price-sheet-body">
              <div className="floating-price-embed">
                <PriceSettings pricePerKwh={pricePerKwh} pricePerM3={pricePerM3} onSave={onSavePrices} />
              </div>

              <div className="floating-avg-block">
                <h3 className="floating-avg-heading">Průměrná spotřeba</h3>
                <p className="floating-avg-hint">
                  Počítáno z reálných intervalů mezi odečty (ne z kalendářního týdne/měsíce). Období končí datem posledního
                  odečtu.
                </p>
                <div className="floating-avg-table-wrap">
                  <table className="floating-avg-table">
                    <thead>
                      <tr>
                        <th scope="col" />
                        <th scope="col">Elektřina</th>
                        <th scope="col">Voda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.key}>
                          <th scope="row">{r.label}</th>
                          <td>
                            {r.elecOk ? (
                              <>
                                <span className="floating-avg-num">{formatNumber(r.elecKwhPerDay, 1, 2)} kWh/d</span>
                                <span className="floating-avg-money">{formatMoney(r.elecKwhPerDay * pricePerKwh)}/d</span>
                              </>
                            ) : (
                              <span className="floating-avg-na">–</span>
                            )}
                          </td>
                          <td>
                            {r.waterOk ? (
                              <>
                                <span className="floating-avg-num">{formatNumber(r.waterM3PerDay, 1, 3)} m³/d</span>
                                <span className="floating-avg-money">{formatMoney(r.waterM3PerDay * pricePerM3)}/d</span>
                              </>
                            ) : (
                              <span className="floating-avg-na">–</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
