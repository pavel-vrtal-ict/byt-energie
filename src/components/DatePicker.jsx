import { useState, useRef, useEffect } from 'react'
import './DatePicker.css'

/** Formát YYYY-MM-DD ↔ zobrazení DD.MM.YYYY */
function toDisplay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return iso
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}

function fromDisplay(str) {
  const parts = str.trim().split(/[.\-/]/).filter(Boolean)
  if (parts.length !== 3) return null
  const d = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const y = parseInt(parts[2], 10)
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null
  if (y < 100) return null
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const WEEKDAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

export function DatePicker({ value, onChange, id, required }) {
  const [displayValue, setDisplayValue] = useState(() => toDisplay(value))
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    return new Date()
  })
  const containerRef = useRef(null)

  useEffect(() => {
    setDisplayValue(toDisplay(value))
  }, [value])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleInputChange = (e) => {
    const v = e.target.value
    setDisplayValue(v)
    const iso = fromDisplay(v)
    if (iso) onChange(iso)
  }

  const handleBlur = () => {
    const iso = fromDisplay(displayValue)
    if (iso) {
      setDisplayValue(toDisplay(iso))
      onChange(iso)
    } else if (value) {
      setDisplayValue(toDisplay(value))
    }
  }

  const handleSelectDay = (day) => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(iso)
    setDisplayValue(toDisplay(iso))
    setOpen(false)
  }

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const startMonday = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < startMonday; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']

  return (
    <div className="date-picker-wrap" ref={containerRef}>
      <div className="date-picker-input-wrap">
        <input
          type="text"
          id={id}
          className="date-picker-input"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="DD.MM.RRRR"
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          className="date-picker-btn"
          onClick={() => setOpen((o) => !o)}
          title="Otevřít kalendář"
          tabIndex={-1}
        >
          📅
        </button>
      </div>
      {open && (
        <div className="date-picker-dropdown">
          <div className="date-picker-nav">
            <button type="button" onClick={prevMonth} title="Předchozí měsíc">‹</button>
            <span className="date-picker-month">{monthNames[month]} {year}</span>
            <button type="button" onClick={nextMonth} title="Následující měsíc">›</button>
          </div>
          <div className="date-picker-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="date-picker-weekday">{w}</span>
            ))}
          </div>
          <div className="date-picker-grid">
            {days.map((d, i) =>
              d === null ? (
                <span key={`e-${i}`} className="date-picker-day empty" />
              ) : (
                <button
                  key={d}
                  type="button"
                  className={`date-picker-day ${value === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` ? 'selected' : ''}`}
                  onClick={() => handleSelectDay(d)}
                >
                  {d}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
