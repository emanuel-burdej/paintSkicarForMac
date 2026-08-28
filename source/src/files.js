function applyLoadedImage(img, meta) {
  undoStack = [];
  redoStack = [];
  clearAllScaleSources();
  currentFilePath = meta.path || null;
  currentFileName = meta.name;
  currentExtension = meta.ext;
  currentMimeType = meta.mime;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  hideSelection();
  fitImageToWorkspace();
  updateInfo();
}

function loadImageFromFile(file) {
  if (!file?.type?.startsWith("image/")) return false;
  commitTextLayer();
  commitPasteLayer();
  const img = new Image();
  img.onload = () => {
    const name = file.name || "image.png";
    const ext = extFromName(name);
    applyLoadedImage(img, {
      path: file.path || null,
      name,
      ext,
      mime: file.type || mimeFromExt(ext),
    });
    showToast(`Opened: ${currentFileName}`);
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => showToast("Could not open image.");
  img.src = URL.createObjectURL(file);
  return true;
}

function openImageMeta(meta) {
  if (!meta?.dataUrl) return;
  commitTextLayer();
  commitPasteLayer();
  const img = new Image();
  img.onload = () => {
    applyLoadedImage(img, {
      path: meta.path,
      name: meta.name,
      ext: meta.ext,
      mime: meta.mime,
    });
    showToast(`Opened: ${currentFileName}`);
  };
  img.onerror = () => showToast("Could not open image.");
  img.src = meta.dataUrl;
}

async function openImage() {
  const f = await window.paintBridge.openImage();
  if (!f) return;
  openImageMeta(f);
}

async function saveFile() {
  commitTextLayer();
  commitPasteLayer();
  if (!currentFilePath) {
    await saveAsFile();
    return;
  }
  const res = await window.paintBridge.saveImage({
    path: currentFilePath,
    base64: base64For(currentMimeType),
  });
  showToast(res?.ok ? `Saved: ${currentFileName}` : "Save failed");
}

async function saveAsFile() {
  commitTextLayer();
  commitPasteLayer();
  const res = await window.paintBridge.saveImageAs({
    currentPath: currentFilePath,
    base64: base64For(currentMimeType),
    ext: currentExtension,
  });
  if (!res) return;
  currentFilePath = res.path;
  currentFileName = res.name;
  currentExtension = res.ext;
  currentMimeType = res.mime;
  updateInfo();
  showToast(`Saved as: ${currentFileName}`);
}
