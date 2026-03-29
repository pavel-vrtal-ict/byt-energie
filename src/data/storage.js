const STORAGE_KEY = 'byt-energie-data'

const defaultData = {
  pricePerKwh: 6,
  pricePerM3: 127,
  initialElectricity: null,
  initialWater: null,
  initialDate: null,
  electricity: [],
  water: [],
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultData }
    const parsed = JSON.parse(raw)
    return {
      ...defaultData,
      ...parsed,
      electricity: Array.isArray(parsed.electricity) ? parsed.electricity : defaultData.electricity,
      water: Array.isArray(parsed.water) ? parsed.water : defaultData.water,
      initialElectricity: parsed.initialElectricity != null ? Number(parsed.initialElectricity) : null,
      initialWater: parsed.initialWater != null ? Number(parsed.initialWater) : null,
      initialDate: parsed.initialDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.initialDate) ? parsed.initialDate : null,
    }
  } catch {
    return { ...defaultData }
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addElectricityEntry(data, entry) {
  const electricity = [...data.electricity, { id: crypto.randomUUID(), ...entry }].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
  return { ...data, electricity }
}

export function addWaterEntry(data, entry) {
  const water = [...data.water, { id: crypto.randomUUID(), ...entry }].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
  return { ...data, water }
}

export function deleteElectricityEntry(data, id) {
  return { ...data, electricity: data.electricity.filter((e) => e.id !== id) }
}

export function deleteWaterEntry(data, id) {
  return { ...data, water: data.water.filter((w) => w.id !== id) }
}

export function updatePrices(data, { pricePerKwh, pricePerM3 }) {
  return {
    ...data,
    ...(pricePerKwh != null && { pricePerKwh: Number(pricePerKwh) }),
    ...(pricePerM3 != null && { pricePerM3: Number(pricePerM3) }),
  }
}

export function updateInitialState(data, { initialElectricity, initialWater, initialDate }) {
  return {
    ...data,
    ...(initialElectricity !== undefined && {
      initialElectricity: initialElectricity === '' || initialElectricity == null ? null : Number(initialElectricity),
    }),
    ...(initialWater !== undefined && {
      initialWater: initialWater === '' || initialWater == null ? null : Number(initialWater),
    }),
    ...(initialDate !== undefined && {
      initialDate: initialDate === '' || initialDate == null ? null : initialDate,
    }),
  }
}

function mergeFromParsed(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Neplatný soubor')
  return {
    ...defaultData,
    ...parsed,
    electricity: Array.isArray(parsed.electricity) ? parsed.electricity : defaultData.electricity,
    water: Array.isArray(parsed.water) ? parsed.water : defaultData.water,
    initialElectricity: parsed.initialElectricity != null ? Number(parsed.initialElectricity) : null,
    initialWater: parsed.initialWater != null ? Number(parsed.initialWater) : null,
    initialDate: parsed.initialDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.initialDate) ? parsed.initialDate : null,
    pricePerKwh: parsed.pricePerKwh != null ? Number(parsed.pricePerKwh) : defaultData.pricePerKwh,
    pricePerM3: parsed.pricePerM3 != null ? Number(parsed.pricePerM3) : defaultData.pricePerM3,
  }
}

/** Obnovení dat ze zálohy (objekt po parse JSON) */
export function parseBackupJSON(text) {
  const root = JSON.parse(text)
  const payload = root?.bytEnergieBackup === true && root.data ? root.data : root
  return mergeFromParsed(payload)
}

/** Objekt pro uložení do souboru zálohy */
export function createBackupPayload(data) {
  return {
    bytEnergieBackup: true,
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}
