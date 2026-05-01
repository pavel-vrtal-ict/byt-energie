import { useState, useEffect, useCallback } from 'react'
import {
  loadData,
  saveData,
  addElectricityEntry,
  addWaterEntry,
  deleteElectricityEntry,
  deleteWaterEntry,
  updatePrices,
  updateInitialState,
} from './data/storage'
import { Header } from './components/Header'
import { FloatingPricePanel } from './components/FloatingPricePanel'
import { InitialStateSettings } from './components/InitialStateSettings'
import { AddEntryForm } from './components/AddEntryForm'
import { SummaryCards } from './components/SummaryCards'
import { EntryList } from './components/EntryList'
import { BackupRestore } from './components/BackupRestore'
import './App.css'

function App() {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const handleAddElectricity = useCallback((entry) => {
    setData((d) => addElectricityEntry(d, entry))
  }, [])

  const handleAddWater = useCallback((entry) => {
    setData((d) => addWaterEntry(d, entry))
  }, [])

  const handleDeleteElectricity = useCallback((id) => {
    setData((d) => deleteElectricityEntry(d, id))
  }, [])

  const handleDeleteWater = useCallback((id) => {
    setData((d) => deleteWaterEntry(d, id))
  }, [])

  const handleUpdatePrices = useCallback((prices) => {
    setData((d) => updatePrices(d, prices))
  }, [])

  const handleUpdateInitialState = useCallback((state) => {
    setData((d) => updateInitialState(d, state))
  }, [])

  const handleRestoreBackup = useCallback((restored) => {
    setData(restored)
  }, [])

  return (
    <div className="app">
      <Header />
      <main className="main">
        <section className="section initial-state-section">
          <InitialStateSettings
            initialElectricity={data.initialElectricity}
            initialWater={data.initialWater}
            initialDate={data.initialDate}
            onSave={handleUpdateInitialState}
          />
        </section>

        <section className="section form-section">
          <AddEntryForm onAddElectricity={handleAddElectricity} onAddWater={handleAddWater} />
        </section>

        <SummaryCards data={data} />

        <p className="floating-entry-hint" role="note">
          Ceny za jednotku a průměrnou spotřebu (den, týden, měsíc, rok) otevřete tlačítkem <strong>Ceny a průměry</strong>{' '}
          vpravo dole.
        </p>

        <section className="section list-section">
          <EntryList
            electricity={data.electricity}
            water={data.water}
            pricePerKwh={data.pricePerKwh}
            pricePerM3={data.pricePerM3}
            initialElectricity={data.initialElectricity}
            initialWater={data.initialWater}
            initialDate={data.initialDate}
            onDeleteElectricity={handleDeleteElectricity}
            onDeleteWater={handleDeleteWater}
          />
        </section>

        <section className="section backup-section">
          <BackupRestore data={data} onRestore={handleRestoreBackup} />
        </section>
      </main>

      <FloatingPricePanel data={data} onSavePrices={handleUpdatePrices} />
    </div>
  )
}

export default App
