const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('paintBridge', {
  openImage: () => ipcRenderer.invoke('open-image'),
  saveImage: (payload) => ipcRenderer.invoke('save-image', payload),
  saveImageAs: (payload) => ipcRenderer.invoke('save-image-as', payload),
  writeImageClipboard: (payload) => ipcRenderer.invoke('write-image-clipboard', payload),
  showAbout: () => ipcRenderer.invoke("show-about"),
  onOpenAbout: (callback) =>
    ipcRenderer.on("open-about", (_event, payload) => callback(payload)),
  onOpenImageFile: (callback) =>
    ipcRenderer.on("open-image-file", (_event, payload) => callback(payload)),
  onMenuOpenImage: (callback) =>
    ipcRenderer.on("menu-open-image", () => callback()),
  notifyRendererReady: () => ipcRenderer.send("renderer-ready"),
  onFnZoomState: (callback) => ipcRenderer.on('fn-zoom-state', (_event, isDown) => callback(Boolean(isDown))),
  onCanvasZoom: (callback) => ipcRenderer.on('canvas-zoom', (_event, direction) => callback(direction))
});
