function showToast(m) {
  toast.textContent = m;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function updateHistoryButtons() {
  undoBtn.disabled = !undoStack.length;
  redoBtn.disabled = !redoStack.length;
}
function pushUndoSnapshot() {
  undoStack.push(canvas.toDataURL("image/png"));
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}
function pushUndo() {
  commitPasteLayer();
  pushUndoSnapshot();
}
function restoreFromDataURL(u) {
  removeTextLayer();
  removePasteLayer();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    hideSelection();
    setZoom(zoom);
    updateInfo();
  };
  img.src = u;
}
function updateAppTitle() {
  const name = currentFileName.replace(/\.[^.]+$/, "") || "Untitled";
  document.title = `${name} - Paint skicar for Mac`;
}
function updateInfo() {
  widthInput.value = pasteLayer
    ? pasteLayer.w
    : selection
      ? selection.w
      : canvas.width;
  heightInput.value = pasteLayer
    ? pasteLayer.h
    : selection
      ? selection.h
      : canvas.height;
  sizeInfo.textContent = `${canvas.width} x ${canvas.height}px`;
  toolInfo.textContent = `${toolNames[tool] || tool}, ${brushSize.value}px`;
  brushSizeValue.textContent = `${brushSize.value}px`;
  formatInfo.textContent = currentExtension.toUpperCase();
  fileInfo.textContent = currentFileName.replace(/\.[^.]+$/, "") || "Untitled";
  updateAppTitle();
  updateHistoryButtons();
}
