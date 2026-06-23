# Datamodell

Prisma används med SQLite i prototypen och en modell som kan flyttas till Postgres/Supabase senare.

Viktiga tabeller:

- `User`: seedade användare och roll.
- `Company`: bolag, fas, bransch, status och journey-text.
- `Document`: sparade dokument, extraherad text och koppling till analyssteg.
- `Assessment`: versionshanterade analyser.
- `MaterialityOverride`: användarkorrigeringar av väsentliga områden.
- `GapQuestion`: kompletteringsfrågor och svar.
- `UpdateEvent`: uppdateringar som skapar nya assessment-versioner.
- `Note`: interna anteckningar.
- `AIJob`: audit för AI-körningar.
