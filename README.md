# Byt – energie & voda

Webová aplikace pro sledování spotřeby **elektrické energie** (kWh) a **vody** (m³) v bytě. Ceny za kWh a m³, výpočty, grafy. Data se ukládají v prohlížeči (localStorage).

## Použití z internetu (GitHub Pages)

Aplikace se po nasazení otevírá v prohlížeči na stabilní adrese — **nemusíte spouštět nic lokálně**.

1. Na [GitHub.com](https://github.com) vytvořte **nový prázdný repozitář** s názvem přesně **`byt-energie`** (kvůli cestě v aplikaci, viz níže).

2. V počítači v adresáři projektu:
   ```bash
   git add .
   git commit -m "První verze aplikace Byt – energie a voda"
   git branch -M main
   git remote add origin https://github.com/VAS_UZIVATEL/byt-energie.git
   git push -u origin main
   ```
   Nahraďte `VAS_UZIVATEL` svým uživatelským jménem na GitHubu.

3. V repozitáři na GitHubu: **Settings → Pages**. U **Build and deployment** zvolte zdroj **GitHub Actions** (ne „Deploy from a branch“).

4. Po dokončení workflow (záložka **Actions**) bude aplikace dostupná na adrese:
   ```text
   https://VAS_UZIVATEL.github.io/byt-energie/
   ```

**Pokud repozitář pojmenujete jinak než `byt-energie`:** v souboru `vite.config.js` změňte v produkci hodnotu `base` na stejný název s lomítky, např. `'/muj-nazev/'`, a znovu pushněte.

## Lokální vývoj (volitelné)

```bash
npm install
npm run dev
```

Prohlížeč: `http://localhost:5173`

## Technologie

React 18, Vite 5, Recharts, CSS. Data v localStorage.

## Licence

Pro osobní a vzdělávací použití.
