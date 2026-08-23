#!/usr/bin/env bash
set -euo pipefail

LEGACY_APP_PATH="/Applications/Paint Skicar.app"
APP_PATH="/Applications/Paint skicar for Mac.app"

if [[ -d "$APP_PATH" ]]; then
  :
elif [[ -d "$LEGACY_APP_PATH" ]]; then
  APP_PATH="$LEGACY_APP_PATH"
else
  echo "Missing installed app: $APP_PATH" >&2
  exit 1
fi

pkill -x "Paint Skicar" >/dev/null 2>&1 || true
env -u ELECTRON_RUN_AS_NODE open -n -a "$APP_PATH"
sleep 2

if ! pgrep -x "Paint Skicar" >/dev/null; then
  echo "Paint skicar for Mac did not stay running." >&2
  exit 1
fi

codesign --verify --deep --strict --verbose=2 "$APP_PATH" >/dev/null 2>&1
echo "Paint skicar for Mac is running."
du -sh "$APP_PATH" "$APP_PATH/Contents/Resources/app.asar"
