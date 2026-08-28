const HANDLE_SCREEN_PX = 10;

function updateHandleMetrics() {
  const local = `${HANDLE_SCREEN_PX / zoom}px`;
  const border = `${2 / zoom}px`;
  const radius = `${2 / zoom}px`;
  shell.style.setProperty("--handle-local-size", local);
  shell.style.setProperty("--handle-local-border", border);
  shell.style.setProperty("--handle-local-radius", radius);
}

function setZoom(z) {
  zoom = Math.max(0.1, Math.min(8, z));
  const displayW = canvas.width * zoom;
  const displayH = canvas.height * zoom;
  canvasWrapper.style.width = `${displayW}px`;
  canvasWrapper.style.height = `${displayH}px`;
  shell.style.transform = `scale(${zoom})`;
  shell.style.setProperty("--shell-zoom", String(zoom));
  canvasWrapper.style.setProperty("--shell-zoom", String(zoom));
  updateHandleMetrics();
  zoomSlider.value = Math.round(zoom * 100);
  zoomInfo.textContent = `${Math.round(zoom * 100)}%`;
  updateSelectionOverlay();
  positionPasteLayer();
  positionTextLayer();
  requestAnimationFrame(centerCanvasInWorkspace);
}
function getShellMousePos(e) {
  const r = shell.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / zoom,
    y: (e.clientY - r.top) / zoom,
  };
}
function centerCanvasInWorkspace() {
  if (!workspaceStage) return;
  const viewW = workspace.clientWidth;
  const viewH = workspace.clientHeight;
  const canvasW = canvas.width * zoom;
  const canvasH = canvas.height * zoom;
  canvasWrapper.style.marginLeft = `${Math.max(0, (viewW - canvasW) / 2)}px`;
  canvasWrapper.style.marginTop = `${Math.max(0, (viewH - canvasH) / 2)}px`;
  requestAnimationFrame(() => {
    const wrapRect = canvasWrapper.getBoundingClientRect();
    const viewRect = workspace.getBoundingClientRect();
    workspace.scrollLeft += wrapRect.left + wrapRect.width / 2 - (viewRect.left + viewRect.width / 2);
    workspace.scrollTop += wrapRect.top + wrapRect.height / 2 - (viewRect.top + viewRect.height / 2);
  });
}
function isCanvasCornerScaleResize(edge) {
  return shouldKeepResizeRatio() && isCornerResizeHandle(edge);
}
function isCanvasEdgeStretchResize(edge) {
  return shouldKeepResizeRatio() && isEdgeResizeHandle(edge);
}
function syncCanvasDisplaySize(w, h) {
  const z = zoom;
  canvasWrapper.style.width = `${w * z}px`;
  canvasWrapper.style.height = `${h * z}px`;
  updateHandleMetrics();
  sizeInfo.textContent = `${w} x ${h}px`;
}
function beginCanvasResize(edge, snapshot) {
  const r = canvasWrapper.getBoundingClientRect();
  const cs = getComputedStyle(canvasWrapper);
  shell.style.left = "0";
  shell.style.top = "0";
  const scaleResize =
    shouldKeepResizeRatio() &&
    (isCornerResizeHandle(edge) || isEdgeResizeHandle(edge));
  if (!scaleResize) clearCanvasScaleSource();
  const source = scaleResize ? resolveCanvasScaleSource(snapshot) : snapshot;
  canvasResizeState = {
    edge,
    snapshot: source,
    zoom,
    startW: canvas.width,
    startH: canvas.height,
    anchorLeft: r.left,
    anchorTop: r.top,
    anchorRight: r.right,
    anchorBottom: r.bottom,
    marginTop: parseFloat(cs.marginTop) || 0,
    marginLeft: parseFloat(cs.marginLeft) || 0,
    preview: null,
  };
}
function computeCanvasResizeFromMouse(e) {
  const s = canvasResizeState;
  if (!s) return null;
  const edge = s.edge;
  const mx = e.clientX;
  const my = e.clientY;
  const z = s.zoom;
  let w = s.startW;
  let h = s.startH;
  let offsetX = 0;
  let offsetY = 0;
  if (edge.includes("e")) w = (mx - s.anchorLeft) / z;
  if (edge.includes("w")) {
    w = (s.anchorRight - mx) / z;
    offsetX = (s.anchorLeft - mx) / z;
  }
  if (edge.includes("s")) h = (my - s.anchorTop) / z;
  if (edge.includes("n")) {
    h = (s.anchorBottom - my) / z;
    offsetY = (s.anchorTop - my) / z;
  }
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  if (shouldKeepResizeRatio() && isCornerResizeHandle(edge)) {
    const scaled = computeLockedAspectSize(s.startW, s.startH, w, h);
    w = Math.max(1, Math.round(scaled.w));
    h = Math.max(1, Math.round(scaled.h));
    ({ w, h } = snapResizeDimensions(w, h, s.startW, s.startH));
    offsetX = edge.includes("w") ? w - s.startW : 0;
    offsetY = edge.includes("n") ? h - s.startH : 0;
  }
  return {
    w,
    h,
    offsetX: Math.round(offsetX),
    offsetY: Math.round(offsetY),
  };
}
function anchorCanvasWrapperForResize(e) {
  if (!canvasResizeState) return;
  const s = canvasResizeState;
  const edge = s.edge;
  let mt = s.marginTop;
  let ml = s.marginLeft;
  if (edge.includes("n")) mt = s.marginTop + (e.clientY - s.anchorTop);
  if (edge.includes("w")) ml = s.marginLeft + (e.clientX - s.anchorLeft);
  canvasWrapper.style.marginTop = `${mt}px`;
  canvasWrapper.style.marginLeft = `${ml}px`;
}
function applyCanvasResizePreview(e) {
  const s = canvasResizeState;
  if (!s) return;
  const size = computeCanvasResizeFromMouse(e);
  if (!size) return;
  const p = s.preview;
  if (
    p &&
    p.w === size.w &&
    p.h === size.h &&
    p.offsetX === size.offsetX &&
    p.offsetY === size.offsetY
  )
    return;
  s.preview = size;
  if (isCanvasCornerScaleResize(s.edge)) {
    previewCanvasScale(size.w, size.h, s.snapshot);
    syncCanvasDisplaySize(size.w, size.h);
    shell.style.left = "0";
    shell.style.top = "0";
    anchorCanvasWrapperForResize(e);
    return;
  }
  if (isCanvasEdgeStretchResize(s.edge)) {
    previewCanvasStretch(size.w, size.h, s.snapshot);
    syncCanvasDisplaySize(size.w, size.h);
    shell.style.left = "0";
    shell.style.top = "0";
    anchorCanvasWrapperForResize(e);
    return;
  }
  const z = s.zoom;
  canvasWrapper.style.width = `${size.w * z}px`;
  canvasWrapper.style.height = `${size.h * z}px`;
  shell.style.left = `${size.offsetX * z}px`;
  shell.style.top = `${size.offsetY * z}px`;
  anchorCanvasWrapperForResize(e);
  sizeInfo.textContent = `${size.w} x ${size.h}px`;
}
function scheduleCanvasResizePreview(e) {
  canvasResizeEvent = e;
  if (canvasResizeRaf) return;
  canvasResizeRaf = requestAnimationFrame(() => {
    canvasResizeRaf = 0;
    if (resizing && canvasResizeEvent) applyCanvasResizePreview(canvasResizeEvent);
    canvasResizeEvent = null;
  });
}
function commitCanvasResize() {
  const s = canvasResizeState;
  if (!s?.preview) return;
  const p = s.preview;
  shell.style.left = "0";
  shell.style.top = "0";
  if (isCanvasCornerScaleResize(s.edge)) {
    resizeCanvasScale(p.w, p.h, s.snapshot);
    if (
      canvasScaleSource &&
      p.w === canvasScaleSource.width &&
      p.h === canvasScaleSource.height
    ) {
      clearCanvasScaleSource();
    }
    return;
  }
  if (isCanvasEdgeStretchResize(s.edge)) {
    resizeCanvasStretch(p.w, p.h, s.snapshot);
    if (
      canvasScaleSource &&
      p.w === canvasScaleSource.width &&
      p.h === canvasScaleSource.height
    ) {
      clearCanvasScaleSource();
    }
    return;
  }
  clearCanvasScaleSource();
  resizeCanvasFrame(p.w, p.h, s.snapshot, p.offsetX, p.offsetY, false);
}
function eventModifierFn(e) {
  return !!(
    e.getModifierState &&
    (e.getModifierState("Fn") ||
      e.getModifierState("FnLock") ||
      e.getModifierState("Symbol") ||
      e.getModifierState("Hyper") ||
      e.getModifierState("OS"))
  );
}
function eventHasFn(e) {
  return !!(fnZoomDown || eventModifierFn(e));
}
function updateFnZoomState(e, isDown) {
  if (e.key === "Fn" || e.code === "Fn" || eventModifierFn(e))
    fnZoomDown = isDown;
}
function fitImageToWorkspace() {
  fitRectToWorkspace(canvas.width, canvas.height);
}
function fitRectToWorkspace(w, h) {
  const ww = workspace.clientWidth;
  const wh = workspace.clientHeight;
  if (ww < 50 || wh < 50) {
    requestAnimationFrame(() => fitRectToWorkspace(w, h));
    return;
  }
  const p = 84,
    g = 28,
    aw = Math.max(120, ww - p - g),
    ah = Math.max(120, wh - p - g);
  setZoom(Math.min(1, aw / Math.max(1, w), ah / Math.max(1, h)));
  requestAnimationFrame(centerCanvasInWorkspace);
}
function getRawMousePos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}
function getMousePos(e) {
  const p = getRawMousePos(e);
  return {
    x: Math.max(0, Math.min(canvas.width, p.x)),
    y: Math.max(0, Math.min(canvas.height, p.y)),
  };
}
