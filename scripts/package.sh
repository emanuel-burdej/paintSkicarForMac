#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="Paint skicar for Mac"
APP_PATH="/Applications/${APP_NAME}.app"
RELEASE_DIR="$ROOT_DIR/release"
DMG_PATH="$RELEASE_DIR/${APP_NAME}.dmg"
DMG_RW="$(mktemp -t paint-skicar-rw).dmg"
BACKGROUND_PNG="$(mktemp -t paint-skicar-bg).png"
MOUNT_DIR=""

cleanup() {
  if [[ -n "$MOUNT_DIR" ]] && mount | grep -q "$MOUNT_DIR"; then
    hdiutil detach "$MOUNT_DIR" -quiet >/dev/null 2>&1 || true
  fi
  rm -f "$DMG_RW" "$BACKGROUND_PNG"
}
trap cleanup EXIT

if [[ "${SKIP_DEPLOY:-0}" != "1" ]]; then
  bash "$ROOT_DIR/scripts/deploy.sh" >/dev/null || true
fi

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing app: $APP_PATH" >&2
  exit 1
fi

mkdir -p "$RELEASE_DIR"
rm -f "$DMG_PATH"

swift "$ROOT_DIR/scripts/generate-dmg-background.swift" "$BACKGROUND_PNG"

hdiutil create -size 512m -volname "$APP_NAME" -fs HFS+ -ov "$DMG_RW" >/dev/null

hdiutil attach -readwrite -noverify -noautoopen "$DMG_RW" >/dev/null
VOLUME_DIR="/Volumes/$APP_NAME"
MOUNT_DIR="$VOLUME_DIR"

cp -R "$APP_PATH" "$VOLUME_DIR/"
ln -s /Applications "$VOLUME_DIR/Applications"
mkdir -p "$VOLUME_DIR/.background"
cp "$BACKGROUND_PNG" "$VOLUME_DIR/.background/background.png"

osascript <<EOF
tell application "Finder"
  tell disk "$APP_NAME"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set bounds of container window to {100, 100, 760, 500}
    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 128
    set background picture of viewOptions to file ".background:background.png"
    set position of item "${APP_NAME}.app" of container window to {150, 180}
    set position of item "Applications" of container window to {450, 180}
    close
    open
    update without registering applications
    delay 1
  end tell
end tell
EOF

hdiutil detach "$MOUNT_DIR" -quiet
MOUNT_DIR=""
hdiutil convert "$DMG_RW" -format UDZO -imagekey zlib-level=9 -o "$DMG_PATH" >/dev/null

echo "Balík pripravený:"
echo "  DMG: $DMG_PATH"
du -sh "$DMG_PATH"
