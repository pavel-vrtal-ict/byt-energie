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
import { PriceSettings } from './components/PriceSettings'
import { InitialStateSettings } from './components/InitialStateSettings'
import { AddEntryForm } from './components/AddEntryForm'
import { SummaryCards } from './components/SummaryCards'
import { AveragesDashboard } from './components/AveragesDashboard'
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
        <SummaryCards data={data} />

        <section className="section dashboard-section" aria-label="Průměrná spotřeba a grafy">
          <h2>Přehled spotřeby</h2>
          <AveragesDashboard data={data} />
        </section>

        <section className="section form-section">
          <AddEntryForm onAddElectricity={handleAddElectricity} onAddWater={handleAddWater} />
        </section>

        <div className="settings-grid">
          <section className="section settings-section">
            <PriceSettings
              pricePerKwh={data.pricePerKwh}
              pricePerM3={data.pricePerM3}
              onSave={handleUpdatePrices}
            />
          </section>

          <section className="section initial-state-section">
            <InitialStateSettings
              initialElectricity={data.initialElectricity}
              initialWater={data.initialWater}
              initialDate={data.initialDate}
              onSave={handleUpdateInitialState}
            />
          </section>
        </div>

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
    </div>
  )
}

export default App
