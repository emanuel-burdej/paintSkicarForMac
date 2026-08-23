# Paint skicar for Mac

Lightweight Paint-style drawing app for macOS. Sketch, select, copy/paste, open images, and save locally. Dark and light mode. Multi-window.

Everything runs on your Mac, nothing is uploaded anywhere.

## What you get

- Pencil, fill, eraser, color picker, text, and shapes
- Select and move content (mouse or arrow keys), copy / paste / cut, resize
- Open / Save / Save as (PNG, JPEG, WebP)
- Drag & drop, multiple windows (`Cmd+N`)
- Zoom, fit-to-view, canvas resize handles
- Dark and light mode

## Screenshot

![Paint skicar for Mac](docs/screenshots/app.png)

## Requirements

- macOS
- [Node.js](https://nodejs.org/) 18 or newer

## Run from source

There is no pre-built download. Clone the repo and run the app with Electron:

```bash
git clone https://github.com/emanuel-burdej/PaintSkicarForMac.git
cd PaintSkicarForMac/source
npx --yes electron@31 .
```

The first run downloads Electron automatically. The app window opens when ready.

## First launch (macOS security warning)

The app is **not signed or notarized** with Apple. On first open, macOS may block it and show something like *“cannot be opened because the developer cannot be verified”*.

That is normal for unsigned apps — not malware. Do this **once**:

1. **Cancel** the dialog if macOS only offers **Move to Trash**.
2. **Right-click** the app (or the **Electron** app that `npx` downloaded) → **Open**.
3. In the new dialog, click **Open** again.

After that, normal double-click works.

**Alternative:** **System Settings → Privacy & Security** → scroll down → **Open Anyway** next to the blocked app name.

If you run from Terminal (`npx electron …`) and macOS blocks **Electron** instead, use the same steps on the Electron app in Finder (often under your user folder in `.npm/_npx/…`).

## Use

- Start drawing, or open an image via **File → Open**.
- Drag an image onto the canvas.
- **Cmd+N** opens another window. Closing the last window quits the app.

## Structure

```
PaintSkicarForMac/
  source/          # app source (main.js, UI, assets)
  docs/screenshots/
```

Electron app for macOS. Source is included — run it locally with the commands above.
