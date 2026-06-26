# Runbook

## Lokal körning

```bash
npm install
cp .env.example .env
npm run db:generate:local
npm run db:push:local
npm run db:seed
npm run dev
```

Fallback om Prisma schema engine faller i lokal miljö:

```bash
npm run db:init
npm run db:seed
```

Öppna `http://localhost:3000`.

## Demo-login

- `admin@movexum.se` / `demo`
- `coach@movexum.se` / `demo`

## Riktig AI

Sätt:

```bash
AI_MOCK_MODE=false
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

Om nyckel saknas går appen automatiskt i mockläge.

Efter ändring av `.env`, starta om dev-servern:

```bash
npm run dev
```

I toppbaren ska status ändras från `Mock-AI aktivt` till `OpenAI aktivt · <modell>`.

Rekommenderat prototyptest:

1. Sätt `AI_MOCK_MODE=false` och en giltig `OPENAI_API_KEY`.
2. Skapa ett nytt bolag med en konkret idébeskrivning.
3. Kontrollera att materialitetsanalysen innehåller bolagsspecifika resonemang, osäkerheter och beaktade men ej väsentliga områden.
4. Godkänn områdena och ladda upp mer information.
5. Kontrollera att informationsgapet ställer högst en fråga per område.
6. Svara kort på frågorna och skapa dashboard.
7. Läs risker, möjligheter, diskussionsfrågor och begränsningar som om de skulle användas i ett coachmöte.
