const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  clipboard,
  nativeImage,
  Menu,
} = require("electron");
const fs = require("fs/promises");
const path = require("path");

const APP_NAME = "Paint skicar for Mac";
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|heif)$/i;

const windows = new Set();
const pendingLaunchFiles = [];

function getLiveWindow() {
  const focused = BrowserWindow.getFocusedWindow();
  if (focused && !focused.isDestroyed() && windows.has(focused)) return focused;
  for (const w of windows) {
    if (!w.isDestroyed()) return w;
  }
  return null;
}

function windowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

function mimeFromExt(ext) {
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "bmp") return "image/bmp";
  if (ext === "tif" || ext === "tiff") return "image/tiff";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/png";
}

async function readImageFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).replace(".", "").toLowerCase() || "png";
  const mime = mimeFromExt(ext);
  return {
    path: filePath,
    name: path.basename(filePath),
    ext,
    mime,
    dataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
  };
}

function pushImageToRenderer(win) {
  if (!win || win.isDestroyed() || !win.paintPendingPayload || !win.paintRendererReady) {
    return;
  }
  const payload = win.paintPendingPayload;
  win.paintPendingPayload = null;
  win.paintPendingFile = null;
  win.paintFresh = false;
  win.webContents.send("open-image-file", payload);
}

async function loadPendingImage(win) {
  const filePath = win.paintPendingFile;
  if (!filePath || win.isDestroyed() || win.paintLoading) return;
  win.paintLoading = true;
  try {
    win.paintPendingPayload = await readImageFile(filePath);
    pushImageToRenderer(win);
  } catch {
    win.paintPendingPayload = null;
    win.paintPendingFile = null;
    dialog.showErrorBox(APP_NAME, `Could not open image:\n${filePath}`);
  } finally {
    if (!win.isDestroyed()) win.paintLoading = false;
  }
}

async function loadPendingImage(win) {
  const filePath = win.paintPendingFile;
  if (!filePath || win.isDestroyed()) return;
  try {
    win.paintPendingPayload = await readImageFile(filePath);
    pushImageToRenderer(win);
  } catch {
    win.paintPendingPayload = null;
    win.paintPendingFile = null;
    dialog.showErrorBox(APP_NAME, `Could not open image:\n${filePath}`);
  }
}

function findFreshEmptyWindow() {
  for (const win of windows) {
    if (win.isDestroyed()) continue;
    if (win.paintPendingFile || win.paintPendingPayload) continue;
    if (!win.paintFresh) continue;
    return win;
  }
  return null;
}

function queueImageFile(filePath) {
  if (!filePath || !IMAGE_EXT_RE.test(filePath)) return;
  if (!app.isReady()) {
    pendingLaunchFiles.push(filePath);
    return;
  }
  const empty = findFreshEmptyWindow();
  if (empty) {
    empty.paintFresh = false;
    empty.paintPendingFile = filePath;
    loadPendingImage(empty);
    empty.show();
    empty.focus();
    return;
  }
  createWindow({ openFile: filePath });
}

function imagePathsFromArgv(argv) {
  return argv.filter((arg, index) => index > 0 && !arg.startsWith("-") && IMAGE_EXT_RE.test(arg));
}

app.on("open-file", (event, filePath) => {
  event.preventDefault();
  queueImageFile(filePath);
});

function openAboutDialog() {
  const liveWin = getLiveWindow();
  if (!liveWin) return;
  liveWin.webContents.send("open-about", { version: app.getVersion() });
}

function createApplicationMenu() {
  if (process.platform !== "darwin") return;
  const template = [
    {
      label: APP_NAME,
      submenu: [
        { label: `About ${APP_NAME}`, click: () => openAboutDialog() },
        { type: "separator" },
        { role: "hide", label: `Hide ${APP_NAME}` },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: `Quit ${APP_NAME}` },
      ],
    },
    {
      label: "File",
      submenu: [
        {
          label: "New Window",
          accelerator: "CmdOrCtrl+N",
          click: () => createWindow(),
        },
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            const liveWin = getLiveWindow();
            if (liveWin) liveWin.webContents.send("menu-open-image");
            else createWindow({ openDialog: true });
          },
        },
      ],
    },
    { role: "editMenu" },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(opts = {}) {
  const offset = Math.min(windows.size, 12) * 24;
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    title: APP_NAME,
    backgroundColor: "#f3f3f3",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (offset) {
    const [x, y] = win.getPosition();
    win.setPosition(x + offset, y + offset);
  }

  win.paintPendingFile = opts.openFile || null;
  win.paintPendingPayload = null;
  win.paintRendererReady = false;
  win.paintOpenDialog = !!opts.openDialog;
  win.paintFresh = !opts.openFile;
  win.paintLoading = false;
  windows.add(win);

  win.on("closed", () => {
    windows.delete(win);
  });

  win.webContents.on("did-start-loading", () => {
    win.paintRendererReady = false;
  });

  win.webContents.on("before-input-event", (_event, input) => {
    const modifiers = input.modifiers || [];
    const hasFn =
      input.key === "Fn" ||
      input.code === "Fn" ||
      modifiers.includes("fn") ||
      modifiers.includes("function");

    if (hasFn) {
      if (!win.isDestroyed()) win.webContents.send("fn-zoom-state", input.type !== "keyUp");
    }
  });

  win.webContents.on("did-finish-load", () => {
    if (win.paintPendingFile && !win.paintPendingPayload) {
      loadPendingImage(win);
    } else {
      pushImageToRenderer(win);
    }
  });

  win.loadFile("index.html");
  if (win.paintPendingFile) loadPendingImage(win);
  return win;
}

app.whenReady().then(async () => {
  createApplicationMenu();
  await new Promise((resolve) => setTimeout(resolve, 150));
  const launchFiles = [
    ...pendingLaunchFiles.splice(0),
    ...imagePathsFromArgv(process.argv),
  ].filter((filePath, index, list) => list.indexOf(filePath) === index);
  if (launchFiles.length) {
    launchFiles.forEach((filePath) => createWindow({ openFile: filePath }));
  } else {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!getLiveWindow()) createWindow();
});

ipcMain.on("renderer-ready", (event) => {
  const win = windowFromEvent(event);
  if (!win) return;
  win.paintRendererReady = true;
  if (win.paintPendingFile && !win.paintPendingPayload) {
    loadPendingImage(win);
  } else {
    pushImageToRenderer(win);
  }
  if (win.paintOpenDialog) {
    win.paintOpenDialog = false;
    win.webContents.send("menu-open-image");
  }
});

ipcMain.handle("show-about", async (event) => {
  const win = windowFromEvent(event) || getLiveWindow();
  if (win) win.webContents.send("open-about", { version: app.getVersion() });
  return { ok: true };
});

ipcMain.handle("open-image", async (event) => {
  const result = await dialog.showOpenDialog(windowFromEvent(event), {
    title: "Open image",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] },
      { name: "All files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths[0]) return null;
  return readImageFile(result.filePaths[0]);
});

ipcMain.handle("save-image", async (_event, payload) => {
  if (!payload?.path || !payload?.base64) return { ok: false, error: "missing_path" };
  const buffer = Buffer.from(payload.base64, "base64");
  await fs.writeFile(payload.path, buffer);
  return { ok: true, path: payload.path, name: path.basename(payload.path) };
});

ipcMain.handle("save-image-as", async (event, payload) => {
  const currentPath = payload?.currentPath || "";
  const ext = payload?.ext || "png";
  const baseName = currentPath
    ? path.basename(currentPath, path.extname(currentPath))
    : "mini-paint";
  const defaultPath = path.join(app.getPath("pictures"), `${baseName}-2.${ext}`);

  const result = await dialog.showSaveDialog(windowFromEvent(event) || getLiveWindow(), {
    title: "Save as",
    defaultPath,
    filters: [
      { name: "PNG", extensions: ["png"] },
      { name: "JPEG", extensions: ["jpg", "jpeg"] },
      { name: "WebP", extensions: ["webp"] },
    ],
  });

  if (result.canceled || !result.filePath) return null;
  const filePath = result.filePath;
  const pickedExt = path.extname(filePath).replace(".", "").toLowerCase() || ext;
  const buffer = Buffer.from(payload.base64, "base64");
  await fs.writeFile(filePath, buffer);

  return {
    ok: true,
    path: filePath,
    name: path.basename(filePath),
    ext: pickedExt,
    mime:
      pickedExt === "jpg" || pickedExt === "jpeg"
        ? "image/jpeg"
        : pickedExt === "webp"
          ? "image/webp"
          : "image/png",
  };
});

ipcMain.handle("write-image-clipboard", async (_event, payload) => {
  if (!payload?.dataUrl) return { ok: false, error: "missing_image" };
  const image = nativeImage.createFromDataURL(payload.dataUrl);
  if (image.isEmpty()) return { ok: false, error: "invalid_image" };
  clipboard.writeImage(image);
  return { ok: true };
});
