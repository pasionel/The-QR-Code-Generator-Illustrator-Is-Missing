#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$BASE_DIR/com.rj.qrcodeillustrator"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Could not find com.rj.qrcodeillustrator next to this installer."
  echo "Unzip the full package first, then run install.command again."
  read -r -p "Press Return to close."
  exit 1
fi

mkdir -p "$(dirname "$TARGET_DIR")"
rsync -a --delete --delete-excluded \
  --exclude ".git" \
  --exclude ".DS_Store" \
  --exclude "dist" \
  --exclude "node_modules" \
  "$SOURCE_DIR/" "$TARGET_DIR/"

for version in 11 12 13 14; do
  defaults write "com.adobe.CSXS.$version" PlayerDebugMode 1
done

echo ""
echo "QR Code Generator has been installed."
echo "Restart Illustrator, then open Window > Extensions > QR Code Generator."
echo ""
read -r -p "Press Return to close."
