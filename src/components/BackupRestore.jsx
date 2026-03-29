import { useRef, useState } from 'react'
import { createBackupPayload, parseBackupJSON } from '../data/storage'
import { todayLocalISO } from '../utils/format'
import './BackupRestore.css'

export function BackupRestore({ data, onRestore }) {
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null)

  const handleExport = () => {
    const payload = createBackupPayload(data)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `byt-energie-zaloha-${todayLocalISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ type: 'ok', text: 'Záloha stažena.' })
    setTimeout(() => setMessage(null), 4000)
  }

  const handlePickFile = () => fileRef.current?.click()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const restored = parseBackupJSON(text)
        const ok = window.confirm(
          'Obnovit data ze zálohy? Současná data v prohlížeči budou nahrazena (doporučujeme nejdříve stáhnout aktuální zálohu). Pokračovat?'
        )
        if (!ok) return
        onRestore(restored)
        setMessage({ type: 'ok', text: 'Data byla obnovena ze souboru.' })
      } catch (err) {
        setMessage({ type: 'err', text: 'Soubor nelze načíst. Zkontrolujte, že jde o zálohu z této aplikace (.json).' })
      }
      setTimeout(() => setMessage(null), 6000)
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="backup-restore">
      <h2>Záloha dat</h2>
      <p className="backup-desc">
        Data se ukládají jen v tomto prohlížeči (localStorage). Při vymazání údajů o stránkách, jiném PC nebo jiném prohlížeči je nemáte — proto pravidelně stahujte zálohu.
      </p>
      <ul className="backup-tips">
        <li><strong>Export</strong> — stáhne soubor JSON se vším (ceny, výchozí stavy, odečty). Uložte ho třeba na disk nebo do OneDrive.</li>
        <li><strong>Obnovení</strong> — nahraje dříve uložený soubor a přepíše aktuální data v prohlížeči.</li>
      </ul>
      <div className="backup-actions">
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Stáhnout zálohu (.json)
        </button>
        <button type="button" className="btn btn-secondary" onClick={handlePickFile}>
          Obnovit ze souboru…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="backup-file-input"
          onChange={handleFile}
        />
      </div>
      {message && (
        <p className={message.type === 'err' ? 'backup-msg backup-msg-err' : 'backup-msg'}>{message.text}</p>
      )}
    </div>
  )
}
