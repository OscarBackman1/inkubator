# Movexum Impact Navigator

En webbaserad prototyp för Movexums interna hållbarhets- och impactbedömning av startups. Verktyget är byggt för att bedöma affärsidéns framtida potential, risker, informationskvalitet och coachande diskussionsfrågor, inte formell CSRD- eller VSME-compliance.

## Kom igång

Appen använder Postgres för både lokal körning och Vercel. Skapa en Postgres-databas, till exempel i Neon, Supabase eller Vercel Postgres, och lägg anslutningssträngen i `.env`.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Seedade användare:

- `admin@movexum.se` / `demo`
- `coach@movexum.se` / `demo`

Mock-AI används när `AI_MOCK_MODE=true` eller när `OPENAI_API_KEY` saknas.

För riktig OpenAI-körning:

```bash
AI_MOCK_MODE=false
OPENAI_API_KEY=din-nyckel
OPENAI_MODEL=gpt-4.1-mini
```

Starta om dev-servern efter ändringen. Toppbaren visar `OpenAI aktivt` när appen faktiskt använder API:t.

## Vercel-testversion

1. Pusha projektet till GitHub.
2. Importera repot i Vercel.
3. Lägg in environment variables i Vercel:
   - `DATABASE_URL`
   - `AI_MOCK_MODE=false`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-5-mini`
   - `OPENAI_TIMEOUT_MS=120000`
   - `MAX_UPLOAD_MB=25`
4. Deploya. Vercel kör `npm run vercel-build`, vilket genererar Prisma Client, pushar databasschemat och bygger Next.js.
5. Kör seed-kommandot mot samma databas för att skapa testkonton:

```bash
npm run db:seed
```

Uppladdade filer sparas temporärt under körningen på Vercel och textutdraget sparas i databasen. För en riktig produkt bör originalfiler lagras i exempelvis Vercel Blob eller S3.

## Viktiga flöden

- Logga in och öppna `/companies`.
- Skapa bolag via `/companies/new`.
- Granska väsentliga områden, komplettera informationsgap och skapa dashboard.
- Uppdatera bolag från dashboarden för att skapa ny assessment-version.
- Se dokument, historik, jämförelse och anteckningar per bolag.
- Exportera enkel HTML-rapport via dashboardens exportknapp.
