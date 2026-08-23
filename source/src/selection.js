function pointInSelection(x, y) {
  if (!selection) return false;
  return (
    x >= selection.x &&
    x <= selection.x + selection.w &&
    y >= selection.y &&
    y <= selection.y + selection.h
  );
}

function captureRectPixels(x, y, w, h, sourceCanvas = canvas) {
  const copied = document.createElement("canvas");
  copied.width = w;
  copied.height = h;
  const cctx = copied.getContext("2d");
  const sx = Math.max(0, x);
  const sy = Math.max(0, y);
  const ex = Math.min(sourceCanvas.width, x + w);
  const ey = Math.min(sourceCanvas.height, y + h);
  const sw = Math.max(0, ex - sx);
  const sh = Math.max(0, ey - sy);
  if (sw && sh) {
    cctx.drawImage(
      sourceCanvas,
      sx,
      sy,
      sw,
      sh,
      sx - x,
      sy - y,
      sw,
      sh,
    );
  }
  return copied;
}

function beginSelectionDrag(e) {
  if (!selection || tool !== "select") return false;
  if (e.target.closest(".selection-handle")) return false;
  const p = getMousePos(e);
  if (!pointInSelection(p.x, p.y)) return false;
  e.preventDefault();
  e.stopPropagation();
  const ox = p.x - selection.x;
  const oy = p.y - selection.y;
  liftSelection();
  if (pasteLayer) {
    pasteLayer.drag = true;
    pasteLayer.dx = ox;
    pasteLayer.dy = oy;
  }
  return true;
}

function nudgeSelectedContent(dx, dy) {
  if (selection && !pasteLayer) liftSelection();
  if (!pasteLayer) return false;
  pasteLayer.x += dx;
  pasteLayer.y += dy;
  positionPasteLayer();
  return true;
}

function setSelection(x1, y1, x2, y2) {
  const x = Math.round(Math.min(x1, x2)),
    y = Math.round(Math.min(y1, y2)),
    w = Math.round(Math.abs(x2 - x1)),
    h = Math.round(Math.abs(y2 - y1));
  selection = w > 2 && h > 2 ? { x, y, w, h } : null;
  updateSelectionOverlay();
}

function applySelectionResize() {
  if (!selectionResize) return;
  const dx = (selectionResize.currentX - selectionResize.startX) / zoom,
    dy = (selectionResize.currentY - selectionResize.startY) / zoom;
  let x = selectionResize.x,
    y = selectionResize.y,
    w = selectionResize.w,
    h = selectionResize.h;
  const corner = selectionResize.corner;
  if (corner.includes("e")) w = selectionResize.w + dx;
  if (corner.includes("s")) h = selectionResize.h + dy;
  if (corner.includes("w")) {
    x = selectionResize.x + dx;
    w = selectionResize.w - dx;
  }
  if (corner.includes("n")) {
    y = selectionResize.y + dy;
    h = selectionResize.h - dy;
  }
  w = Math.max(4, Math.round(w));
  h = Math.max(4, Math.round(h));
  x = Math.round(x);
  y = Math.round(y);
  selection = { x, y, w, h };
  updateSelectionOverlay();
}

function liftSelection() {
  if (!selection) return;
  pushUndo();
  const picked = captureRectPixels(selection.x, selection.y, selection.w, selection.h);
  const pctx = picked.getContext("2d");
  pctx.fillStyle = "white";
  pctx.globalCompositeOperation = "destination-over";
  pctx.fillRect(0, 0, picked.width, picked.height);
  pctx.globalCompositeOperation = "source-over";
  const sx = Math.max(0, selection.x),
    sy = Math.max(0, selection.y),
    ex = Math.min(canvas.width, selection.x + selection.w),
    ey = Math.min(canvas.height, selection.y + selection.h),
    sw = Math.max(0, ex - sx),
    sh = Math.max(0, ey - sy);
  ctx.fillStyle = "white";
  if (sw && sh) ctx.fillRect(sx, sy, sw, sh);
  const x = selection.x,
    y = selection.y;
  hideSelection();
  createMovableLayer(picked, x, y);
}

function updateSelectionOverlay() {
  if (!selection) {
    selectionBox.style.display = "none";
    return;
  }
  selectionBox.style.display = "block";
  selectionBox.style.left = `${selection.x}px`;
  selectionBox.style.top = `${selection.y}px`;
  selectionBox.style.width = `${selection.w}px`;
  selectionBox.style.height = `${selection.h}px`;
  selectionBox.style.clipPath = clippedInset(
    selection.x,
    selection.y,
    selection.w,
    selection.h,
  );
}

function hideSelection() {
  selection = null;
  selectionResize = null;
  updateSelectionOverlay();
}

function initSelectionHandles() {
  selectionBox.onmousedown = (e) => {
    if (e.target.closest(".selection-handle")) return;
    beginSelectionDrag(e);
  };
  selectionBox.querySelectorAll(".selection-handle").forEach((h) => {
    h.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selection) return;
      selectionResize = {
        corner: h.dataset.selResize || "se",
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        x: selection.x,
        y: selection.y,
        w: selection.w,
        h: selection.h,
      };
    };
  });
}

function deleteActiveSelection() {
  if (textLayer) {
    removeTextLayer();
    updateInfo();
    return;
  }
  if (pasteLayer) {
    pushUndoSnapshot();
    removePasteLayer();
    updateInfo();
    return;
  }
  if (selection) {
    pushUndoSnapshot();
    ctx.fillStyle = "white";
    ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    hideSelection();
    updateInfo();
  }
}

async function copySelection(cut = false) {
  let copied = null;
  if (pasteLayer) {
    copied = document.createElement("canvas");
    copied.width = pasteLayer.w;
    copied.height = pasteLayer.h;
    copied.getContext("2d").drawImage(pasteLayer.canvas, 0, 0);
    if (cut) {
      pushUndoSnapshot();
      removePasteLayer();
      updateInfo();
    }
  } else if (selection) {
    copied = captureRectPixels(selection.x, selection.y, selection.w, selection.h);
    if (cut) {
      pushUndoSnapshot();
      const sx = Math.max(0, selection.x);
      const sy = Math.max(0, selection.y);
      const ex = Math.min(canvas.width, selection.x + selection.w);
      const ey = Math.min(canvas.height, selection.y + selection.h);
      const sw = Math.max(0, ex - sx);
      const sh = Math.max(0, ey - sy);
      ctx.fillStyle = "white";
      if (sw && sh) ctx.fillRect(sx, sy, sw, sh);
      hideSelection();
      updateInfo();
    }
  }
  if (!copied || (!copied.width && !copied.height)) return showToast("Select an area first.");
  clipboardCanvas = copied;
  if (!cut && selection) hideSelection();
  try {
    await window.paintBridge.writeImageClipboard({
      dataUrl: clipboardCanvas.toDataURL("image/png"),
    });
    showToast(cut ? "Cut to clipboard." : "Copied to clipboard.");
  } catch (_e) {
    showToast("Could not write to clipboard.");
  }
}

function applySelectionContentResize(newW, newH) {
  if (!selection) return;
  pushUndo();
  const { x, y, w, h } = selection;
  newW = Math.max(1, Math.round(newW));
  newH = Math.max(1, Math.round(newH));
  const picked = document.createElement("canvas");
  picked.width = w;
  picked.height = h;
  const pctx = picked.getContext("2d");
  setupCanvasContext(pctx);
  pctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, w, h);
  setupCanvasContext(ctx);
  ctx.drawImage(picked, 0, 0, w, h, x, y, newW, newH);
  selection = { x, y, w: newW, h: newH };
  updateSelectionOverlay();
}

function pasteSelection() {
  if (!clipboardCanvas) return showToast("Nothing to paste.");
  addPasteLayer(clipboardCanvas);
}
