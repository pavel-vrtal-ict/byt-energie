import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lokálně "/" — na GitHub Pages musí odpovídat názvu repozitáře (viz README).
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/byt-energie/' : '/',
  plugins: [react()],
}))
