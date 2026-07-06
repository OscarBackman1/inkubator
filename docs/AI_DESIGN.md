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

Materialitetsanalysen använder idébeskrivningen, fritexten och övrigt uppladdat underlag från nybolagsflödet. Syftet är att väsentliga områden ska väljas mot hela den information som finns från start, inte mot en isolerad idébeskrivning.

Slutanalysen använder textbaserade områdesbedömningar i `areaAssessments` i stället för synliga hållbarhetspoäng. Övergripande bedömning är en självständig bedömning av affärsidéns system-, bransch- eller marknadspåverkan, inte ett snitt av ENV, SOC och GOV. Varje kategori har potentialetikett, bedömningstext och osäkerheter som stöd för coachning. Informationsläget visas som en kort kommentar i `informationQualityComment`, inte som en siffra.

Riskbilden visar inte den interna risketiketten i dashboardens huvudkort. Texten ska därför vara konkret och självbärande: styrkor, viktigaste riskluckor, vad som kan bli allvarligt vid skalning och vad som verkar hanterbart i närtid.

Dokument betraktas som opålitligt källmaterial. Prompter ska ignorera instruktioner i dokument som försöker ändra roll, outputformat, säkerhetsregler eller be modellen avslöja prompt.
