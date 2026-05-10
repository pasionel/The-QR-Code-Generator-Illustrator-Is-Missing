# QR Code Generator til Adobe Illustrator

Dette er en simpel CEP-extension til Illustrator. Den laver en QR-kode ud fra tekst eller en URL og indsætter den i det aktive Illustrator-dokument som vektor-firkanter.

## Funktioner

- Genererer QR-koder fra tekst eller URL.
- Indsætter QR-koden i det aktive Illustrator-dokument.
- Tegner kun de sorte QR-felter som vektorobjekter.
- Ingen API-kald og ingen eksterne runtime-afhængigheder.

## Installation

Kør:

`./install-macos.sh`

Genstart derefter Illustrator, og åbn panelet via `Window > Extensions > QR Code Generator`.

Manuelt kan du gøre det samme sådan:

1. Kopier mappen `qr-code-generator` til:

   `~/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator`

2. Tillad unsigned CEP-extensions på macOS:

   `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`

   Hvis panelet ikke dukker op i en nyere Illustrator-version, gentag for den relevante CSXS-version, fx `com.adobe.CSXS.12`, `com.adobe.CSXS.13` eller `com.adobe.CSXS.14`.

3. Genstart Illustrator.

4. Åbn panelet via `Window > Extensions > QR Code Generator`.

## Brug

1. Åbn eller opret et Illustrator-dokument.
2. Skriv tekst eller en URL i panelet.
3. Klik `Indsæt QR-kode`.

QR-koden placeres midt på den aktive artboard og bliver markeret som én gruppe. Plugin'et tegner kun de sorte QR-felter; baggrund og kontrast styres i Illustrator-dokumentet.

## Begrænsninger

- QR-generatoren er med vilje holdt simpel og bruger fejlkorrektion M.
- Meget lange tekster kan afvises i panelet.
- Dette er ikke UXP. Illustrator har ikke en stabil, offentlig UXP-pluginmodel til samme type tredjeparts-panel, så CEP er den mest praktiske løsning her.

## Pakke til release

Kør:

`npm run package`

Det laver et zip-arkiv i `dist/`, som kan uploades til en GitHub release.

## Tredjepart

- `lib/qrcode-generator.js` er vendored fra `qrcode-generator` og bruges under MIT-licens. Se `THIRD_PARTY_NOTICES.md`.

## Licens

MIT
