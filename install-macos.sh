#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.rj.qrcodeillustrator"

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

echo "Installed. Restart Illustrator, then open Window > Extensions > QR Code Generator."
