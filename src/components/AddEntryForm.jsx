import { useState } from 'react'
import { DatePicker } from './DatePicker'
import { todayLocalISO } from '../utils/format'
import './AddEntryForm.css'

export function AddEntryForm({ onAddElectricity, onAddWater }) {
  const [activeTab, setActiveTab] = useState('electricity')
  const [date, setDate] = useState(() => todayLocalISO())
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')

  const resetForm = () => {
    setValue('')
    setNote('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = parseFloat(value.replace(',', '.'))
    if (Number.isNaN(v) || v < 0) return
    if (activeTab === 'electricity') {
      onAddElectricity({ date, value: v, note: note.trim() || undefined })
    } else {
      onAddWater({ date, value: v, note: note.trim() || undefined })
    }
    resetForm()
  }

  return (
    <div className="add-entry-form">
      <h2>Přidat odečet</h2>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'electricity' ? 'active' : ''}`}
          onClick={() => setActiveTab('electricity')}
        >
          ⚡ Elektřina (kWh)
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'water' ? 'active' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          💧 Voda (m³)
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            <span>Datum odečtu</span>
            <DatePicker
              id="entry-date"
              value={date}
              onChange={setDate}
              required
            />
          </label>
          <label>
            <span>{activeTab === 'electricity' ? 'Stav měřidla (kWh)' : 'Stav měřidla (m³)'}</span>
            <input
              type="number"
              step="0.001"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={activeTab === 'electricity' ? 'např. 1550' : 'např. 15,2'}
              required
            />
          </label>
        </div>
        <label className="form-note">
          <span>Poznámka (volitelné)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="např. leden 2025"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Přidat odečet
        </button>
      </form>
    </div>
  )
}
