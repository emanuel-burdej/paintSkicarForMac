# Paint skicar for Mac

Lightweight Paint-style drawing app for macOS. Sketch, select, copy/paste, open images (including Finder **Open With**), and save locally. Dark and light mode. Multi-window.

Everything runs on your Mac — nothing is uploaded anywhere.

## What you get

- Pencil, fill, eraser, color picker, text, and shapes
- Select and move content (mouse or arrow keys), copy / paste / cut, resize
- Open / Save / Save as (PNG, JPEG, WebP)
- Finder **Open With**, drag & drop, multiple windows (`Cmd+N`)
- Zoom, fit-to-view, canvas resize handles
- Dark and light mode

## Screenshot

![Paint skicar for Mac](docs/screenshots/app.png)

## Install

1. Download **Paint skicar for Mac.dmg** from [Releases](https://github.com/emanuel-burdej/PaintSkicarForMac/releases).
2. Open the DMG and drag **Paint skicar for Mac** into **Applications**.
3. **First launch:** right-click the app → **Open** → confirm **Open**.

After that, normal double-click works.

### If macOS says “Malware Blocked and Moved to Trash”

That is a Gatekeeper false positive for an unsigned app — **not** malware.

1. Click **Done**.
2. Put the app back from **Trash** into **Applications** (or drag it from the DMG again).
3. Right-click → **Open** → **Open**,  
   **or** go to **System Settings → Privacy & Security → Open Anyway**.

## Use

- Open the app and start drawing, or open an image via **File → Open**.
- Right-click an image in Finder → **Open With → Paint skicar for Mac**.
- **Cmd+N** opens another window. Closing the last window quits the app.

## Structure

```
PaintSkicarForMac/
  source/
  docs/screenshots/
```

Electron app for macOS. Source is included for transparency; install from the DMG release.
