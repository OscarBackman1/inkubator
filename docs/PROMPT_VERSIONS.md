# Promptversioner

## 2026-07-09-v2

Korrigerar huvudkategorierna till ENV, SOC och GOV.

- Kund-, användar-, patient-, medborgar- och målgruppspåverkan kategoriseras som SOC.
- Ansvar, avtal, styrning, datahantering och professionella samarbeten kategoriseras normalt som GOV.
- Egna områden använder endast prefixen `OWN-ENV`, `OWN-SOC` eller `OWN-GOV`.
- Den felaktigt införda separata kundkategorin i v1 har tagits bort ur prompt, schema, UI och downstream-analys.

## 2026-07-09-v1

Öppnar väsentlighetsanalysen för bolagsspecifika områden och skärper urvalet.

- Eventuella referensområden används som inspiration och mappningsstöd, inte som en sluten lista.
- En väsentlighetsgrind hindrar generell skalning, försäljning och produktutveckling från att väljas utan tydlig hållbarhetskoppling.
- Egna AI-genererade områden får en saklig huvudkategori och interna ID:n enligt `OWN-<kategori>-<nummer>`.
- Denna version ersattes av v2 innan kategorimodellen färdigställdes.
- Miljöperspektivet ska alltid övervägas för digitala, SaaS-, AI- och plattformsbolag, utan att automatiskt bli väsentligt.
- Evidens, säkerhet, framtidsrelevans och osäkerheter har fått tydligare och kontraktssäkra instruktioner.

## 2026-07-06-v3

Förtydligar riskbilden i dashboarden.

- `riskIndicator.rationale` ska kunna stå ensam utan synlig risketikett.
- Riskbilden ska beskriva konkreta styrkor, riskluckor, skalningsrisk och hanterbarhet i närtid.
- Prompten undviker abstrakta formuleringar som "balans mellan".

## 2026-07-06-v2

Förtydligar den övergripande dashboardbedömningen.

- Övergripande potential ska vara en självständig bedömning av system-, bransch- eller marknadspåverkan, inte ett snitt av ENV, SOC och GOV.
- Ett bolag kan bedömas som Systemförändrande även om vissa områden är svagare, om kärnaffären driver omställning.
- `overall.uncertaintyNotes` ska vara tom; osäkerheter visas i respektive område och i informationsläget.

## 2026-07-06-v1

Materialitetsanalysen utgår från samlat uppladdat underlag.

- `input.documentText` ersätter tidigare idétexts-fält i materialitetssteget.
- Väsentliga områden ska väljas utifrån bransch, fritext och allt initialt uppladdat material.
- Informationsgapet körs efter godkänd materialitet på samma underlag.

## 2026-06-28-v2

Tar bort synlig siffra för informationsläge i slutanalysen.

- `informationQualityComment` ersätter krav på informationspoäng i dashboard-JSON.
- Kommentaren ska vara mycket kort, svensk och förklara hur underlaget bör läsas.
- Interna informationsvärden kan fortfarande användas som fallback och för tidigare analysversioner.

## 2026-06-28-v1

Byter slutanalys från synliga hållbarhetspoäng till textbaserade områdesbedömningar.

- `areaAssessments` innehåller övergripande bedömning, miljömässig hållbarhet, social hållbarhet och styrning.
- Varje område får `potentialLabel`, genomarbetad bedömningstext och osäkerheter.
- Uppdateringsanalysen markerar ändrade områdesbedömningar i stället för ändrade poäng.
- Slutanalysen ska fortsatt vara ett coachande beslutsstöd för startups, inte ESG-rapportering eller compliancekontroll.

## 2026-06-27-v2

Skärpt fasstyrning för frågor.

- `input.phase` skickas med till informationsgap, slutanalys och uppdateringsanalys.
- Frågor ska anpassas efter Movexumfas och inte kräva mer moget underlag än bolaget rimligen har.
- För Screening ska frågor kunna besvaras med antaganden, tidiga observationer, kundsamtal eller planerade tester.
- För senare faser kan frågor handla mer om pilotlärdomar, arbetssätt och resultat, men utan krav på formell rapportering.

## 2026-06-27-v1

Förtydligade regler för kompletteringsfrågor och diskussionsfrågor.

- Frågor ska kunna besvaras av en coach eller grundare utan specialistkunskap.
- Frågor ska undvika tekniska termer, förkortningar och fackspråk.
- Frågor ska handla om observerbara fakta, erfarenheter, feedback, resultat, beslut eller arbetssätt.
- Frågor ska kunna besvaras med 3-5 meningar och vara rimliga utifrån bolagets fas.

## 2026-06-26-v1

Förtydligad väsentlighetsanalys efter testfeedback.

- `rationale` för väsentliga områden ska vara 2-3 meningar om vad området handlar om och varför det är väsentligt för just bolaget.
- Risker, möjligheter, nuläge, framtida utveckling och rekommendationer ska inte blandas in i den korta huvudtexten.
- Osäkerheter ska fortsatt markeras separat.

## 2026-06-23-v1

Första prototypversionen.

- Startup-anpassad systeminstruktion.
- CSRD/ESRS/VSME används som inspirationsram, inte compliancekrav.
- Dokument behandlas som opålitligt källmaterial.
- Output ska vara svenska JSON-objekt enligt Zod-scheman.
