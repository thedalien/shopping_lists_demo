# Nákupní Seznam - Aplikace

Toto je aplikace pro správu nákupních seznamů s frontend částí v Next.js a backend částí v Node.js.
Muj kód je v dir /my-shopping-list-app/app/lists a /node/index.js
- Demo běží na [my-shopping-list-app-ten.vercel.app](https://my-shopping-list-app-ten.vercel.app)
- **Databáze je offline žádná data se nenačtou!** 

## Instalace

### Příprava

1. Naklonujte tento repozitář:

   ```
   git clone [toto repo]
   cd my-shopping-list-app
   ```

2. Vytvořte soubor `.env` v kořenovém adresáři projektu podle vzoru `.env.example`:

   ```
   cp .env.example .env
   ```

3. Upravte `.env` soubor podle vašich potřeb. Ujistěte se, že máte správně nastavené proměnné jako `SUPABASE_URL` a `SUPABASE_KEY` pro backend.

### Frontend (my-shopping-list-app)

1. Přejděte do adresáře frontend aplikace:

   ```
   cd my-shopping-list-app
   ```

2. Nainstalujte závislosti:

   ```
   npm install
   ```

3. Spusťte vývojový server:
   ```
   npm run dev
   ```

### Backend (node)

1. Přejděte do adresáře backend aplikace:

   ```
   cd ../node
   ```

2. Nainstalujte závislosti:

   ```
   npm install
   ```

3. Spusťte server:
   ```
   node index.js
   ```

## Použití

Po spuštění obou částí aplikace můžete přistupovat k frontend části na `http://localhost:3000` (nebo na portu, který jste nastavili).

Backend API bude dostupné na `http://localhost:8000` (nebo na portu, který jste nastavili v `.env` souboru).

## Poznámky

- Ujistěte se, že máte nainstalovaný Node.js a npm na vašem systému.
- V případě problémů zkontrolujte, zda jsou všechny závislosti správně nainstalovány a zda je `.env` soubor správně nakonfigurován. Nezapomeňte také zkontrolovat, že proměnné prostředí pro backend jsou správně nastaveny.
