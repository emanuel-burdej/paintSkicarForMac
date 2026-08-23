function setupCanvasContext(c) {
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
}
function copyCurrentCanvas() {
  const old = document.createElement("canvas");
  old.width = canvas.width;
  old.height = canvas.height;
  old.getContext("2d").drawImage(canvas, 0, 0);
  return old;
}
function drawScaledHighQuality(source, w, h) {
  let tmp = source;
  while (tmp.width * 0.5 > w && tmp.height * 0.5 > h) {
    const step = document.createElement("canvas");
    step.width = Math.max(w, Math.floor(tmp.width * 0.5));
    step.height = Math.max(h, Math.floor(tmp.height * 0.5));
    const stepCtx = step.getContext("2d");
    setupCanvasContext(stepCtx);
    stepCtx.drawImage(tmp, 0, 0, step.width, step.height);
    tmp = step;
  }
  setupCanvasContext(ctx);
  ctx.drawImage(tmp, 0, 0, w, h);
}
function resizeCanvas(w, h) {
  commitTextLayer();
  commitPasteLayer();
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  const old = copyCurrentCanvas();
  canvas.width = w;
  canvas.height = h;
  setupCanvasContext(ctx);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  drawScaledHighQuality(old, w, h);
  hideSelection();
  setZoom(zoom);
  updateInfo();
}
function resizeCanvasFrame(w, h, source = null, offsetX = 0, offsetY = 0, preview = false) {
  if (!preview) {
    commitTextLayer();
    commitPasteLayer();
  }
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  const old = source || copyCurrentCanvas();
  offsetX = Math.round(offsetX);
  offsetY = Math.round(offsetY);
  if (offsetX >= 0 && w <= old.width) offsetX = Math.min(offsetX, Math.max(0, old.width - w));
  if (offsetY >= 0 && h <= old.height) offsetY = Math.min(offsetY, Math.max(0, old.height - h));
  if (offsetX < 0 && w <= old.width) offsetX = Math.max(offsetX, -(old.width - w));
  if (offsetY < 0 && h <= old.height) offsetY = Math.max(offsetY, -(old.height - h));
  canvas.width = w;
  canvas.height = h;
  setupCanvasContext(ctx);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(old, offsetX, offsetY);
  if (!preview) hideSelection();
  setZoom(zoom);
  if (preview) sizeInfo.textContent = `${w} x ${h}px`;
  else updateInfo();
}
function expandCanvasTo(w, h) {
  w = Math.max(canvas.width, Math.round(w));
  h = Math.max(canvas.height, Math.round(h));
  if (w === canvas.width && h === canvas.height) return;
  const old = document.createElement("canvas");
  old.width = canvas.width;
  old.height = canvas.height;
  old.getContext("2d").drawImage(canvas, 0, 0);
  canvas.width = w;
  canvas.height = h;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(old, 0, 0);
  hideSelection();
  setZoom(zoom);
  updateInfo();
}
function resizeActiveLayer(w, h) {
  if (!pasteLayer) {
    showToast("Select or paste an image first.");
    return;
  }
  pushUndoSnapshot();
  w = Math.max(8, Math.round(w));
  h = Math.max(8, Math.round(h));
  pasteLayer.w = w;
  pasteLayer.h = h;
  redrawPasteLayer();
  positionPasteLayer();
  updateInfo();
}
function getResizeTargetSize() {
  if (pasteLayer) return { w: pasteLayer.w, h: pasteLayer.h };
  if (selection) return { w: selection.w, h: selection.h };
  return { w: canvas.width, h: canvas.height };
}
function calcResizeSize(baseW, baseH, hIn, vIn) {
  if (resizeMode === "percent") {
    const scaleH = Math.max(1, Math.min(1000, hIn)) / 100;
    const scaleV = isKeepRatioLinked() ? scaleH : Math.max(1, Math.min(1000, vIn)) / 100;
    return {
      w: Math.max(1, Math.round(baseW * scaleH)),
      h: Math.max(1, Math.round(baseH * scaleV)),
    };
  }
  const w = Math.max(1, Math.round(hIn));
  const h = isKeepRatioLinked()
    ? Math.max(1, Math.round(w * (baseH / baseW)))
    : Math.max(1, Math.round(vIn));
  return { w, h };
}
function populateResizeDialog() {
  const base = getResizeTargetSize();
  if (resizeMode === "percent") {
    widthInput.value = 100;
    heightInput.value = 100;
  } else {
    widthInput.value = base.w;
    heightInput.value = base.h;
  }
  skewHorizontalInput.value = 0;
  skewVerticalInput.value = 0;
}
function openResizeDialog() {
  populateResizeDialog();
  resizeDialog.classList.remove("hidden");
  resizeDialog.setAttribute("aria-hidden", "false");
  widthInput.focus();
  widthInput.select();
}
function closeResizeDialog() {
  resizeDialog.classList.add("hidden");
  resizeDialog.setAttribute("aria-hidden", "true");
}
function skewCanvas(hDeg, vDeg) {
  hDeg = +hDeg || 0;
  vDeg = +vDeg || 0;
  if (!hDeg && !vDeg) return;
  const w = canvas.width;
  const h = canvas.height;
  const tanH = Math.tan((hDeg * Math.PI) / 180);
  const tanV = Math.tan((vDeg * Math.PI) / 180);
  const src = copyCurrentCanvas();
  const map = (x, y) => ({ x: x + y * tanH, y: y + x * tanV });
  const pts = [map(0, 0), map(w, 0), map(0, h), map(w, h)];
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const nw = Math.max(1, Math.ceil(maxX - minX));
  const nh = Math.max(1, Math.ceil(maxY - minY));
  canvas.width = nw;
  canvas.height = nh;
  setupCanvasContext(ctx);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, nw, nh);
  ctx.setTransform(1, tanV, tanH, 1, -minX, -minY);
  ctx.drawImage(src, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  hideSelection();
  setZoom(zoom);
}
function applyResize() {
  commitTextLayer();
  commitPasteLayer();
  const hIn = +widthInput.value || (resizeMode === "percent" ? 100 : 1);
  const vIn = +heightInput.value || (resizeMode === "percent" ? 100 : 1);
  const skewH = +skewHorizontalInput.value || 0;
  const skewV = +skewVerticalInput.value || 0;
  const hasSkew = skewH || skewV;

  if (selection && !pasteLayer) {
    const { w, h } = calcResizeSize(selection.w, selection.h, hIn, vIn);
    applySelectionContentResize(w, h);
    if (hasSkew) {
      pushUndo();
      skewCanvas(skewH, skewV);
    }
  } else if (pasteLayer) {
    const { w, h } = calcResizeSize(pasteLayer.w, pasteLayer.h, hIn, vIn);
    resizeActiveLayer(w, h);
    if (hasSkew) {
      pushUndo();
      skewCanvas(skewH, skewV);
    }
  } else {
    pushUndo();
    const { w, h } = calcResizeSize(canvas.width, canvas.height, hIn, vIn);
    resizeCanvas(w, h);
    if (hasSkew) skewCanvas(skewH, skewV);
  }

  closeResizeDialog();
  updateInfo();
}
function setResizeMode(m) {
  resizeMode = m;
  resizeModePercent.checked = m === "percent";
  resizeModePixels.checked = m === "pixels";
  const unit = m === "percent" ? "%" : "px";
  resizeUnitH.textContent = unit;
  resizeUnitV.textContent = unit;
  widthInput.max = m === "percent" ? 1000 : 10000;
  heightInput.max = m === "percent" ? 1000 : 10000;
  if (!resizeDialog.classList.contains("hidden")) populateResizeDialog();
}
function syncLinkedResizeInput(changed) {
  if (!isKeepRatioLinked()) return;
  const base = getResizeTargetSize();
  if (changed === "h") {
    if (resizeMode === "percent") heightInput.value = widthInput.value;
    else heightInput.value = Math.max(1, Math.round((+widthInput.value * base.h) / base.w));
  } else if (changed === "v") {
    if (resizeMode === "percent") widthInput.value = heightInput.value;
    else widthInput.value = Math.max(1, Math.round((+heightInput.value * base.w) / base.h));
  }
}
