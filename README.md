# Movexum Impact Navigator

En webbaserad prototyp för Movexums interna hållbarhets- och impactbedömning av startups. Verktyget är byggt för att bedöma affärsidéns framtida potential, risker, informationskvalitet och coachande diskussionsfrågor med textbaserade områdesbedömningar, inte formell CSRD- eller VSME-compliance.

## Kom igång

Appen använder lokal SQLite för prototyptestning. Standardkonfigurationen i `.env.example` pekar på `prisma/dev.db`.

```bash
npm install
cp .env.example .env
npm run db:generate:local
npm run db:push:local
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
OPENAI_MODEL=gpt-5.5
```

Starta om dev-servern efter ändringen. Toppbaren visar `OpenAI aktivt` när appen faktiskt använder API:t.

## Vercel-testversion

1. Pusha projektet till GitHub.
2. Importera repot i Vercel.
3. Vercel använder defaultschemat `prisma/schema.prisma` med Postgres. Lokal testning använder `prisma/schema.local.prisma` med SQLite.
4. Lägg in environment variables i Vercel:
   - `DATABASE_URL`
   - `AI_MOCK_MODE=false`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-5.5`
   - `OPENAI_TIMEOUT_MS=120000`
   - `MAX_UPLOAD_MB=25`
5. Deploya. Vercel kör `npm run vercel-build`, vilket genererar Prisma Client, pushar databasschemat och bygger Next.js.
6. Kör seed-kommandot mot samma databas för att skapa testkonton:

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
