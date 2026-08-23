#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/source"
LEGACY_APP_PATH="/Applications/Paint Skicar.app"
APP_PATH="/Applications/Paint skicar for Mac.app"
APP_DISPLAY_NAME="Paint skicar for Mac"
TMP_ASAR="$(mktemp -t paint-skicar.XXXXXX.asar)"

cleanup() {
  rm -f "$TMP_ASAR"
  rm -rf "$HOME/.npm/_npx"
}
trap cleanup EXIT

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Missing source directory: $SOURCE_DIR" >&2
  exit 1
fi

if [[ -d "$APP_PATH" ]]; then
  :
elif [[ -d "$LEGACY_APP_PATH" ]]; then
  mv "$LEGACY_APP_PATH" "$APP_PATH"
else
  echo "Missing installed app: $APP_PATH" >&2
  exit 1
fi

ASAR_PATH="$APP_PATH/Contents/Resources/app.asar"
PLIST_PATH="$APP_PATH/Contents/Info.plist"

node --check "$SOURCE_DIR/main.js" >/dev/null
node --check "$SOURCE_DIR/preload.js" >/dev/null

if command -v asar >/dev/null 2>&1; then
  asar pack "$SOURCE_DIR" "$TMP_ASAR"
else
  npx --yes @electron/asar pack "$SOURCE_DIR" "$TMP_ASAR"
fi

cp "$TMP_ASAR" "$ASAR_PATH"

sync_document_types() {
  /usr/libexec/PlistBuddy -c "Delete :CFBundleDocumentTypes" "$PLIST_PATH" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes array" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0 dict" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeName string Image" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeRole string Editor" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSHandlerRank string Alternate" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeExtensions array" "$PLIST_PATH"

  local extensions=(png jpg jpeg gif webp bmp tif tiff heic heif)
  local i=0
  for ext in "${extensions[@]}"; do
    /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeExtensions:$i string $ext" "$PLIST_PATH"
    i=$((i + 1))
  done

  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSItemContentTypes array" "$PLIST_PATH"
  local utis=(
    public.png
    public.jpeg
    public.gif
    org.webmproject.webp
    com.microsoft.bmp
    public.tiff
    public.heic
    public.heif
  )
  i=0
  for uti in "${utis[@]}"; do
    /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSItemContentTypes:$i string $uti" "$PLIST_PATH"
    i=$((i + 1))
  done
}

sync_macos_app_name() {
  local frameworks="$APP_PATH/Contents/Frameworks"
  local suffixes=("" " (GPU)" " (Plugin)" " (Renderer)")

  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName '$APP_DISPLAY_NAME'" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Set :CFBundleName '$APP_DISPLAY_NAME'" "$PLIST_PATH"
  /usr/libexec/PlistBuddy -c "Delete :NSMainNibFile" "$PLIST_PATH" 2>/dev/null || true

  for suffix in "${suffixes[@]}"; do
    local legacy="Paint Skicar Helper${suffix}"
    local target="${APP_DISPLAY_NAME} Helper${suffix}"
    local src="$frameworks/${legacy}.app"
    local dst="$frameworks/${target}.app"
    [[ -d "$src" ]] || continue
    rm -rf "$dst"
    cp -R "$src" "$dst"
    mv "$dst/Contents/MacOS/$legacy" "$dst/Contents/MacOS/$target"
    /usr/libexec/PlistBuddy -c "Set :CFBundleExecutable '$target'" "$dst/Contents/Info.plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName '$target'" "$dst/Contents/Info.plist"
  done
}

HASH="$(shasum -a 256 "$ASAR_PATH" | awk '{print $1}')"
/usr/libexec/PlistBuddy -c "Set :ElectronAsarIntegrity:Resources/app.asar:hash $HASH" "$PLIST_PATH"
sync_macos_app_name
sync_document_types
/usr/libexec/PlistBuddy -c "Set :NSHumanReadableCopyright 'Vibe coded by Em'" "$PLIST_PATH" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSHumanReadableCopyright string 'Vibe coded by Em'" "$PLIST_PATH"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString '2.0.0'" "$PLIST_PATH"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion '2.0.0'" "$PLIST_PATH"

codesign --force --deep --sign - "$APP_PATH" >/dev/null 2>&1
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f -R -trusted "$APP_PATH" >/dev/null 2>&1 || true

pkill -x "Paint Skicar" >/dev/null 2>&1 || true
env -u ELECTRON_RUN_AS_NODE open -n -a "$APP_PATH"
sleep 2

if ! pgrep -x "Paint Skicar" >/dev/null; then
  echo "Paint skicar for Mac did not stay running." >&2
  exit 1
fi

codesign --verify --deep --strict --verbose=2 "$APP_PATH" >/dev/null 2>&1

echo "Paint skicar for Mac deployed."
du -sh "$APP_PATH" "$ASAR_PATH"
