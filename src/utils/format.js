/** Formátování pro české locale (cs-CZ) */

const locale = 'cs-CZ'

/** Dnešní datum jako YYYY-MM-DD (lokální čas, bez posunu přes UTC) */
export function todayLocalISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Datum z řetězce YYYY-MM-DD jako lokální kalendářní den (ne UTC půlnoc) */
function parseISODateLocal(iso) {
  if (!iso || typeof iso !== 'string') return null
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function toDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = parseISODateLocal(value)
    return d && !Number.isNaN(d.getTime()) ? d : new Date(value)
  }
  return new Date(value)
}

/** Měna v Kč – např. "123 Kč" nebo "123,50 Kč" */
export function formatMoney(value) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Číslo s desetinnou čárkou – např. "1,5" nebo "5,25" */
export function formatNumber(value, minDecimals = 0, maxDecimals = 2) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value)
}

/** Datum – např. "15. 1. 2025" */
export function formatDate(value) {
  const d = toDate(value)
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}

/** Krátké datum pro grafy – např. "15. 1." */
export function formatDateShort(value) {
  const d = toDate(value)
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'numeric',
  })
}
