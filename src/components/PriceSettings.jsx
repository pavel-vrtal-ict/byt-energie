import { useState } from 'react'
import './PriceSettings.css'

export function PriceSettings({ pricePerKwh, pricePerM3, onSave }) {
  const [kwh, setKwh] = useState(String(pricePerKwh))
  const [m3, setM3] = useState(String(pricePerM3))
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const k = parseFloat(kwh.replace(',', '.'))
    const m = parseFloat(m3.replace(',', '.'))
    if (!Number.isNaN(k) && k >= 0) onSave({ pricePerKwh: k })
    if (!Number.isNaN(m) && m >= 0) onSave({ pricePerM3: m })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form className="price-settings" onSubmit={handleSubmit}>
      <h2>Ceny za jednotku</h2>
      <p className="price-settings-desc">Zadejte aktuální cenu za kWh (elektřina) a za m³ (voda). Použije se pro výpočet nákladů.</p>
      <div className="price-inputs">
        <label className="price-field">
          <span className="price-label">Cena za kWh (Kč)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={kwh}
            onChange={(e) => setKwh(e.target.value)}
            placeholder="např. 5,50"
          />
        </label>
        <label className="price-field">
          <span className="price-label">Cena za m³ vody (Kč)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={m3}
            onChange={(e) => setM3(e.target.value)}
            placeholder="např. 127"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {saved ? 'Uloženo ✓' : 'Uložit ceny'}
        </button>
      </div>
    </form>
  )
}
