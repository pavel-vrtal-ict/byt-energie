import { useState, useEffect } from 'react'
import { DatePicker } from './DatePicker'
import { todayLocalISO } from '../utils/format'
import './InitialStateSettings.css'

export function InitialStateSettings({ initialElectricity, initialWater, initialDate, onSave }) {
  const [elec, setElec] = useState(initialElectricity != null ? String(initialElectricity) : '')
  const [water, setWater] = useState(initialWater != null ? String(initialWater) : '')
  const [date, setDate] = useState(initialDate || todayLocalISO())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDate(initialDate || todayLocalISO())
  }, [initialDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const eVal = elec.trim() === '' ? null : parseFloat(elec.replace(',', '.'))
    const wVal = water.trim() === '' ? null : parseFloat(water.replace(',', '.'))
    onSave({
      initialElectricity: eVal == null || Number.isNaN(eVal) || eVal < 0 ? null : eVal,
      initialWater: wVal == null || Number.isNaN(wVal) || wVal < 0 ? null : wVal,
      initialDate: date || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form className="initial-state-settings" onSubmit={handleSubmit}>
      <h2>Výchozí stav měřidel</h2>
      <p className="initial-state-desc">
        Stav měřidel na začátku sledování. Spotřeba se počítá jako rozdíl mezi odečty (od výchozího stavu). Můžete nechat prázdné.
      </p>
      <div className="initial-state-inputs">
        <label className="initial-state-field">
          <span className="initial-state-label">Datum výchozího stavu</span>
          <DatePicker id="initial-date" value={date} onChange={setDate} />
        </label>
        <label className="initial-state-field">
          <span className="initial-state-label">Výchozí stav elektřiny (kWh)</span>
          <input
            type="text"
            inputMode="decimal"
            value={elec}
            onChange={(e) => setElec(e.target.value)}
            placeholder="např. 1500"
          />
        </label>
        <label className="initial-state-field">
          <span className="initial-state-label">Výchozí stav vody (m³)</span>
          <input
            type="text"
            inputMode="decimal"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            placeholder="např. 12,5"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {saved ? 'Uloženo ✓' : 'Uložit výchozí stavy'}
        </button>
      </div>
    </form>
  )
}
