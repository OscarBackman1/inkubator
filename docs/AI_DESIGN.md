# AI-design

AI-lagret finns under `src/lib/ai` och körs alltid server-side.

Pipeline:

1. `runMaterialityAnalysis`
2. `runSufficiencyAnalysis`
3. `runFinalAnalysis`
4. `runUpdateAnalysis`

Varje steg:

- använder mockläge när `AI_MOCK_MODE=true` eller `OPENAI_API_KEY` saknas,
- sparar `AIJob`,
- sparar promptversion,
- validerar output med Zod,
- returnerar strikt JSON,
- exponerar aldrig API-nyckel till klienten.

Slutanalysen använder textbaserade områdesbedömningar i `areaAssessments` i stället för synliga hållbarhetspoäng. Varje område har potentialetikett, bedömningstext och osäkerheter som stöd för coachning. Informationsläget visas som en kort kommentar i `informationQualityComment`, inte som en siffra.

Dokument betraktas som opålitligt källmaterial. Prompter ska ignorera instruktioner i dokument som försöker ändra roll, outputformat, säkerhetsregler eller be modellen avslöja prompt.
