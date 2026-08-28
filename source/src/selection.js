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

function isCornerResizeHandle(handle) {
  return handle === "nw" || handle === "ne" || handle === "sw" || handle === "se";
}

function isEdgeResizeHandle(handle) {
  return handle === "n" || handle === "s" || handle === "e" || handle === "w";
}

function shouldKeepResizeRatio() {
  return keepResizeRatio?.checked === true;
}

function computeLockedAspectSize(startW, startH, w, h) {
  const scaleX = w / startW;
  const scaleY = h / startH;
  const scale =
    Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY;
  if (Math.abs(scale - 1) < 0.002) {
    return { w: startW, h: startH };
  }
  return {
    w: startW * scale,
    h: startH * scale,
  };
}

function snapResizeDimensions(w, h, origW, origH) {
  if (Math.abs(w - origW) <= 2 && Math.abs(h - origH) <= 2) {
    return { w: origW, h: origH };
  }
  return { w, h };
}

function applyLockedAspectPosition(state, handle, w, h) {
  let x = state.x;
  let y = state.y;
  if (handle.includes("w")) x = state.x + state.w - w;
  if (handle.includes("n")) y = state.y + state.h - h;
  return { x, y };
}

function computeResizeBox(state, corner, dx, dy, minSize = 4) {
  let x = state.x;
  let y = state.y;
  let w = state.w;
  let h = state.h;

  if (corner.includes("e")) w = state.w + dx;
  if (corner.includes("s")) h = state.h + dy;
  if (corner.includes("w")) {
    x = state.x + dx;
    w = state.w - dx;
  }
  if (corner.includes("n")) {
    y = state.y + dy;
    h = state.h - dy;
  }

  if (shouldKeepResizeRatio() && isCornerResizeHandle(corner)) {
    const scaled = computeLockedAspectSize(state.w, state.h, w, h);
    w = scaled.w;
    h = scaled.h;
    ({ x, y } = applyLockedAspectPosition(state, corner, w, h));
  }

  w = Math.max(minSize, Math.round(w));
  h = Math.max(minSize, Math.round(h));
  if (shouldKeepResizeRatio() && isCornerResizeHandle(corner)) {
    ({ w, h } = snapResizeDimensions(w, h, state.w, state.h));
    ({ x, y } = applyLockedAspectPosition(state, corner, w, h));
  } else {
    if (corner.includes("w")) x = state.x + state.w - w;
    if (corner.includes("n")) y = state.y + state.h - h;
  }
  return { x: Math.round(x), y: Math.round(y), w, h };
}

function applySelectionResize() {
  if (!selectionResize) return;
  const dx = (selectionResize.currentX - selectionResize.startX) / zoom;
  const dy = (selectionResize.currentY - selectionResize.startY) / zoom;
  selection = computeResizeBox(selectionResize, selectionResize.corner, dx, dy, 4);
  if (selectionResize.picked && selectionResize.baseSnapshot) {
    ctx.putImageData(selectionResize.baseSnapshot, 0, 0);
    setupCanvasContext(ctx);
    const sw = selectionResize.sourceW;
    const sh = selectionResize.sourceH;
    if (selection.w === sw && selection.h === sh) {
      ctx.drawImage(selectionResize.picked, selection.x, selection.y);
    } else {
      ctx.drawImage(
        selectionResize.picked,
        0,
        0,
        sw,
        sh,
        selection.x,
        selection.y,
        selection.w,
        selection.h,
      );
    }
  }
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
  clearSelectionScaleSource();
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
      pushUndo();
      const picked = captureRectPixels(
        selection.x,
        selection.y,
        selection.w,
        selection.h,
      );
      ctx.fillStyle = "white";
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
      const scaleResize =
        shouldKeepResizeRatio() &&
        (isCornerResizeHandle(h.dataset.selResize || "se") ||
          isEdgeResizeHandle(h.dataset.selResize || "se"));
      if (!scaleResize) clearSelectionScaleSource();
      if (scaleResize && !selectionScaleSource) {
        selectionScaleSource = {
          picked,
          sourceW: picked.width,
          sourceH: picked.height,
        };
      }
      const source = scaleResize && selectionScaleSource
        ? selectionScaleSource
        : { picked, sourceW: picked.width, sourceH: picked.height };
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
        picked: source.picked,
        sourceW: source.sourceW,
        sourceH: source.sourceH,
        baseSnapshot: ctx.getImageData(0, 0, canvas.width, canvas.height),
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

function transformSourceCanvas(source, drawFn, outW, outH) {
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const outCtx = out.getContext("2d");
  setupCanvasContext(outCtx);
  drawFn(outCtx, source);
  return out;
}

function flipHorizontalCanvas(source) {
  return transformSourceCanvas(source, (outCtx, src) => {
    outCtx.translate(src.width, 0);
    outCtx.scale(-1, 1);
    outCtx.drawImage(src, 0, 0);
  }, source.width, source.height);
}

function flipVerticalCanvas(source) {
  return transformSourceCanvas(source, (outCtx, src) => {
    outCtx.translate(0, src.height);
    outCtx.scale(1, -1);
    outCtx.drawImage(src, 0, 0);
  }, source.width, source.height);
}

function rotateCanvas90CW(source) {
  return transformSourceCanvas(source, (outCtx, src) => {
    outCtx.translate(source.height, 0);
    outCtx.rotate(Math.PI / 2);
    outCtx.drawImage(src, 0, 0);
  }, source.height, source.width);
}

function rotateCanvas90CCW(source) {
  return transformSourceCanvas(source, (outCtx, src) => {
    outCtx.translate(0, source.width);
    outCtx.rotate(-Math.PI / 2);
    outCtx.drawImage(src, 0, 0);
  }, source.height, source.width);
}

function rotateCanvas180(source) {
  return transformSourceCanvas(source, (outCtx, src) => {
    outCtx.translate(src.width, src.height);
    outCtx.rotate(Math.PI);
    outCtx.drawImage(src, 0, 0);
  }, source.width, source.height);
}

function transformWholeCanvas(transformSource) {
  commitTextLayer();
  commitPasteLayer();
  hideSelection();
  pushUndo();

  const transformed = transformSource(copyCurrentCanvas());
  canvas.width = transformed.width;
  canvas.height = transformed.height;
  setupCanvasContext(ctx);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(transformed, 0, 0);
  setZoom(zoom);
  fitRectToWorkspace(canvas.width, canvas.height);
  updateInfo();
}

function transformActiveSelection(transformSource, swapDisplaySize) {
  if (selection && !pasteLayer) liftSelection();
  else pushUndo();

  const cx = pasteLayer.x + pasteLayer.w / 2;
  const cy = pasteLayer.y + pasteLayer.h / 2;
  const oldW = pasteLayer.w;
  const oldH = pasteLayer.h;

  pasteLayer.source = transformSource(pasteLayer.source);
  if (swapDisplaySize) {
    pasteLayer.w = oldH;
    pasteLayer.h = oldW;
  }
  pasteLayer.x = Math.round(cx - pasteLayer.w / 2);
  pasteLayer.y = Math.round(cy - pasteLayer.h / 2);
  redrawPasteLayer();
  positionPasteLayer();
  updateInfo();
  return true;
}

function applyTransform(kind) {
  const actions = {
    "rotate-right": { fn: rotateCanvas90CW, swap: true },
    "rotate-left": { fn: rotateCanvas90CCW, swap: true },
    "rotate-180": { fn: rotateCanvas180, swap: false },
    "flip-horizontal": { fn: flipHorizontalCanvas, swap: false },
    "flip-vertical": { fn: flipVerticalCanvas, swap: false },
  };
  const action = actions[kind];
  if (!action) return;
  if (pasteLayer || selection) transformActiveSelection(action.fn, action.swap);
  else transformWholeCanvas(action.fn);
}
