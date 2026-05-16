# QR Code Generator for Adobe Illustrator

This is a simple CEP extension for Adobe Illustrator. It generates a QR code from text or a URL and inserts it into the active Illustrator document as vector rectangles.

## Features

- Generates QR codes from text or URLs.
- Generates vCard QR codes from separate contact fields.
- Inserts the QR code into the active Illustrator document.
- Draws only the black QR modules as vector artwork.
- QR codes are inserted as a single compound vector object instead of many separate small rectangles.
- Makes no API calls and has no external runtime dependencies.

## Installation

Download `QR-Code-Generator-Illustrator-mac.zip` from the GitHub release page.

Unzip it, then double-click `install.command`.

The installer copies the extension to:

`~/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator`

It also enables unsigned CEP extensions for the common Adobe CSXS versions.

Restart Illustrator, then open the panel from `Window > Extensions > QR Code Generator`.

### Manual Installation

If you do not want to use the installer, download `com.rj.qrcodeillustrator.zip`, unzip it, and place the `com.rj.qrcodeillustrator` folder here:

`~/Library/Application Support/Adobe/CEP/extensions/`

The final path should be:

`~/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator`

Enable unsigned CEP extensions on macOS:

`defaults write com.adobe.CSXS.11 PlayerDebugMode 1`

Restart Illustrator, then open the panel from `Window > Extensions > QR Code Generator`.

## Installation From Source

Run:

`./install-macos.sh`

Restart Illustrator, then open the panel from `Window > Extensions > QR Code Generator`.

Manual installation does the same thing:

1. Copy the project contents to:

   `~/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator`

2. Enable unsigned CEP extensions on macOS:

   `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`

   If the panel does not appear in a newer Illustrator version, repeat the command for the relevant CSXS version, for example `com.adobe.CSXS.12`, `com.adobe.CSXS.13`, or `com.adobe.CSXS.14`.

3. Restart Illustrator.

4. Open the panel from `Window > Extensions > QR Code Generator`.

## Usage

1. Open or create an Illustrator document.
2. Choose `Text` or `vCard`.
3. Enter the QR content.
4. Click `Insert QR Code`.

The QR code is placed in the center of the active artboard and selected as one group. The plugin draws only the black QR modules; background and contrast are controlled in the Illustrator document.

QR codes are built as compound vector artwork from traced module outlines, which avoids the usual cleanup step of handling hundreds of separate square objects.

## Limitations

- The generator intentionally keeps the setup simple and uses error correction level M.
- Very long text can be rejected by the panel.
- vCards are generated as vCard 3.0 data with common contact fields.
- This is not UXP. Illustrator does not currently provide the same stable public UXP plugin model for this kind of third-party panel, so CEP is the practical option here.

## Release Package

Run:

`npm run package`

This creates two zip files in `dist/`:

- `QR-Code-Generator-Illustrator-mac.zip`: recommended user package with `install.command`.
- `com.rj.qrcodeillustrator.zip`: direct extension-folder package for manual installation.

## Third-party

- `lib/qrcode-generator.js` is vendored from `qrcode-generator` and used under the MIT license. See `THIRD_PARTY_NOTICES.md`.

## License

MIT
