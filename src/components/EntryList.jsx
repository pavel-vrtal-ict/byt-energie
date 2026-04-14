import { useMemo } from 'react'
import { formatDate, formatMoney, formatNumber } from '../utils/format'
import { getConsumptionsWithEntries } from '../data/consumption'
import './EntryList.css'

export function EntryList({
  electricity,
  water,
  pricePerKwh,
  pricePerM3,
  initialElectricity,
  initialWater,
  initialDate,
  onDeleteElectricity,
  onDeleteWater,
}) {
  const electricRows = useMemo(() => {
    const rows = getConsumptionsWithEntries(electricity, initialElectricity)
    const hasInitial =
      initialElectricity != null &&
      !Number.isNaN(initialElectricity) &&
      initialDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(initialDate)

    if (!hasInitial) return rows

    return [
      {
        entry: { id: '__initial_electricity__', date: initialDate, value: initialElectricity, note: 'Výchozí stav' },
        consumption: 0,
        isInitial: true,
      },
      ...rows,
    ]
  }, [electricity, initialElectricity, initialDate])

  const waterRows = useMemo(() => {
    const rows = getConsumptionsWithEntries(water, initialWater)
    const hasInitial =
      initialWater != null &&
      !Number.isNaN(initialWater) &&
      initialDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(initialDate)

    if (!hasInitial) return rows

    return [
      {
        entry: { id: '__initial_water__', date: initialDate, value: initialWater, note: 'Výchozí stav' },
        consumption: 0,
        isInitial: true,
      },
      ...rows,
    ]
  }, [water, initialWater, initialDate])

  return (
    <div className="entry-list">
      <h2>Historie odečtů</h2>
      <p className="entry-list-hint">Stav = odečet měřidla, spotřeba = rozdíl oproti výchozímu stavu / předchozímu odečtu.</p>

      <div className="entry-group">
        <h3>⚡ Elektřina</h3>
        {electricRows.length === 0 ? (
          <p className="empty">Žádné odečty</p>
        ) : (
          <ul className="entries">
            {[...electricRows].reverse().map(({ entry, consumption }) => (
              <li key={entry.id} className={`entry entry-electric ${entry.note === 'Výchozí stav' ? 'entry-initial' : ''}`}>
                <div className="entry-main">
                  <span className="entry-date">{formatDate(entry.date)}</span>
                  <span className="entry-state">Stav: {formatNumber(entry.value, 1, 1)} kWh</span>
                  <span className="entry-consumption">Spotřeba: {formatNumber(consumption, 1, 1)} kWh</span>
                  <span className="entry-cost">{formatMoney(consumption * pricePerKwh)}</span>
                </div>
                {entry.note && <span className="entry-note">{entry.note}</span>}
                {entry.note !== 'Výchozí stav' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDeleteElectricity(entry.id)}
                    title="Smazat"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="entry-group">
        <h3>💧 Voda</h3>
        {waterRows.length === 0 ? (
          <p className="empty">Žádné odečty</p>
        ) : (
          <ul className="entries">
            {[...waterRows].reverse().map(({ entry, consumption }) => (
              <li key={entry.id} className={`entry entry-water ${entry.note === 'Výchozí stav' ? 'entry-initial' : ''}`}>
                <div className="entry-main">
                  <span className="entry-date">{formatDate(entry.date)}</span>
                  <span className="entry-state">Stav: {formatNumber(entry.value, 1, 2)} m³</span>
                  <span className="entry-consumption">Spotřeba: {formatNumber(consumption, 1, 2)} m³</span>
                  <span className="entry-cost">{formatMoney(consumption * pricePerM3)}</span>
                </div>
                {entry.note && <span className="entry-note">{entry.note}</span>}
                {entry.note !== 'Výchozí stav' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDeleteWater(entry.id)}
                    title="Smazat"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
