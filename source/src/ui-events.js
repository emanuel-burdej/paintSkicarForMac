function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("paint-skicar-theme", theme);
}

function initTheme() {
  applyTheme(localStorage.getItem("paint-skicar-theme") || "light");
}

function toggleDarkMode() {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
}

function applyFontSizeChange() {
  updateTextLayerStyle();
  updateInfo();
}

function renderSwatches() {
  swatches.innerHTML = "";
  palette.forEach((c) => {
    const b = document.createElement("button");
    b.className = "swatch";
    b.style.background = c;
    b.title = c;
    b.onclick = (e) => {
      if (e.shiftKey) secondaryColor.value = c;
      else {
        colorPicker.value = c;
        updateTextLayerStyle();
      }
      updateInfo();
    };
    b.oncontextmenu = (e) => {
      e.preventDefault();
      secondaryColor.value = c;
    };
    swatches.appendChild(b);
  });
}
document
  .querySelectorAll("[data-tool]")
  .forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
canvas.onmousedown = (e) => {
  if (resizing) return;
  if (tool === "text") {
    commitPasteLayer();
    commitTextLayer();
    createTextLayer(getMousePos(e).x, getMousePos(e).y);
    return;
  }
  commitTextLayer();
  commitPasteLayer();
  const p = getMousePos(e);
  startX = lastX = p.x;
  startY = lastY = p.y;
  if (tool === "select") {
    if (beginSelectionDrag(e)) return;
    hideSelection();
    drawing = true;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return;
  }
  if (tool === "picker") {
    colorPicker.value = hexFromPixel(p.x, p.y);
    updateTextLayerStyle();
    showToast(`Color picked: ${colorPicker.value}`);
    return;
  }
  if (tool === "fill") {
    pushUndo();
    floodFill(p.x, p.y, colorPicker.value);
    return;
  }
  if (
    [
      "brush",
      "eraser",
      "line",
      "curve",
      "ellipse",
      "rect",
      "roundrect",
      "triangle",
      "righttri",
      "diamond",
      "pentagon",
      "hexagon",
      "star",
      "arrow",
      "select",
    ].includes(tool)
  ) {
    drawing = true;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (tool !== "select") pushUndo();
  }
};
window.onmousemove = (e) => {
  if (selectionResize) {
    selectionResize.currentX = e.clientX;
    selectionResize.currentY = e.clientY;
    applySelectionResize();
    return;
  }
  if (pasteResize) {
    const dx = (e.clientX - pasteResize.startX) / zoom,
      dy = (e.clientY - pasteResize.startY) / zoom;
    let x = pasteResize.x,
      y = pasteResize.y,
      w = pasteResize.w,
      h = pasteResize.h;
    if (pasteResize.corner.includes("e")) w = pasteResize.w + dx;
    if (pasteResize.corner.includes("s")) h = pasteResize.h + dy;
    if (pasteResize.corner.includes("w")) {
      x = pasteResize.x + dx;
      w = pasteResize.w - dx;
    }
    if (pasteResize.corner.includes("n")) {
      y = pasteResize.y + dy;
      h = pasteResize.h - dy;
    }
    w = Math.max(8, Math.round(w));
    h = Math.max(8, Math.round(h));
    x = Math.round(x);
    y = Math.round(y);
    pasteLayer.x = x;
    pasteLayer.y = y;
    pasteLayer.w = w;
    pasteLayer.h = h;
    redrawPasteLayer();
    positionPasteLayer();
    return;
  }
  if (pasteLayer?.drag) {
    const p = getShellMousePos(e);
    pasteLayer.x = p.x - pasteLayer.dx;
    pasteLayer.y = p.y - pasteLayer.dy;
    positionPasteLayer();
    return;
  }
  if (textLayer?.drag) {
    const r = shell.getBoundingClientRect();
    textLayer.x = (e.clientX - r.left) / zoom - textLayer.dx;
    textLayer.y = (e.clientY - r.top) / zoom - textLayer.dy;
    positionTextLayer();
    return;
  }
  const p = getMousePos(e);
  posInfo.textContent = `${Math.round(p.x)}, ${Math.round(p.y)}px`;
  if (resizing) {
    scheduleCanvasResizePreview(e);
    return;
  }
  if (!drawing) return;
  if (tool === "brush" || tool === "eraser") {
    drawLine(lastX, lastY, p.x, p.y);
    lastX = p.x;
    lastY = p.y;
    return;
  }
  if (snapshot) ctx.putImageData(snapshot, 0, 0);
  if (tool === "select") {
    const sp = getRawMousePos(e);
    setSelection(startX, startY, sp.x, sp.y);
    return;
  }
  drawShape(startX, startY, p.x, p.y, tool);
};
window.onmouseup = () => {
  if (pasteLayer) pasteLayer.drag = false;
  if (textLayer) textLayer.drag = false;
  pasteResize = null;
  selectionResize = null;
  drawing = false;
  if (canvasResizeRaf) {
    cancelAnimationFrame(canvasResizeRaf);
    canvasResizeRaf = 0;
  }
  if (resizing) {
    if (canvasResizeEvent) applyCanvasResizePreview(canvasResizeEvent);
    commitCanvasResize();
    updateInfo();
  }
  canvasResizeEvent = null;
  resizing = false;
  snapshot = null;
  canvasResizeState = null;
};
document.querySelectorAll(".canvas-resize").forEach(
  (h) =>
    (h.onmousedown = (e) => {
      e.preventDefault();
      pushUndo();
      resizing = true;
      beginCanvasResize(h.dataset.resize || "se", copyCurrentCanvas());
    }),
);
openImageBtn.onclick = openImage;
saveBtn.onclick = saveFile;
saveAsBtn.onclick = saveAsFile;
darkModeToggle.onclick = toggleDarkMode;
resizeOpenBtn.onclick = openResizeDialog;
resizeApplyBtn.onclick = applyResize;
resizeCancelBtn.onclick = closeResizeDialog;
resizeDialogClose.onclick = closeResizeDialog;
resizeDialogBackdrop.onclick = closeResizeDialog;

function openAboutDialogView(payload) {
  if (payload?.version) {
    aboutVersion.textContent = `Version ${payload.version}`;
  }
  aboutDialog.classList.remove("hidden");
  aboutDialog.setAttribute("aria-hidden", "false");
}

function closeAboutDialog() {
  aboutDialog.classList.add("hidden");
  aboutDialog.setAttribute("aria-hidden", "true");
}

aboutOkBtn.onclick = closeAboutDialog;
aboutDialogBackdrop.onclick = closeAboutDialog;
window.paintBridge?.onOpenAbout?.(openAboutDialogView);

resizeModePercent.onchange = () => setResizeMode("percent");
resizeModePixels.onchange = () => setResizeMode("pixels");
keepRatioLink.onclick = () => keepRatioLink.classList.toggle("active");
widthInput.oninput = () => syncLinkedResizeInput("h");
heightInput.oninput = () => syncLinkedResizeInput("v");
brushSize.oninput = updateInfo;
colorPicker.oninput = () => {
  updateTextLayerStyle();
  updateInfo();
};
colorPicker.onchange = () => {
  updateTextLayerStyle();
  updateInfo();
};
secondaryColor.oninput = () => {
  updateTextLayerStyle();
  updateInfo();
};
secondaryColor.onchange = () => {
  updateTextLayerStyle();
  updateInfo();
};
fontFamily.onchange = () => {
  updateTextLayerStyle();
  updateInfo();
};
fontSize.onchange = applyFontSizeChange;
fontSize.onblur = applyFontSizeChange;
fontBold.onclick = () => toggleFontStyle(fontBold);
fontItalic.onclick = () => toggleFontStyle(fontItalic);
fontUnderline.onclick = () => toggleFontStyle(fontUnderline);
fontStrikethrough.onclick = () => toggleFontStyle(fontStrikethrough);
fontAlignLeft.onclick = () => setTextAlign("left");
fontAlignCenter.onclick = () => setTextAlign("center");
fontAlignRight.onclick = () => setTextAlign("right");
fontBackgroundFill.onchange = () => {
  updateTextLayerStyle();
  updateInfo();
};
copyBtn.onclick = () => {
  void copySelection();
};
aboutBtn.onclick = () => window.paintBridge?.showAbout?.();
pasteBtn.onclick = async () => {
  if (!(await pasteFromSystemClipboard())) pasteSelection();
};
undoBtn.onclick = () => {
  if (!undoStack.length) return;
  removeTextLayer();
  removePasteLayer();
  redoStack.push(canvas.toDataURL("image/png"));
  restoreFromDataURL(undoStack.pop());
};
redoBtn.onclick = () => {
  if (!redoStack.length) return;
  removeTextLayer();
  removePasteLayer();
  undoStack.push(canvas.toDataURL("image/png"));
  restoreFromDataURL(redoStack.pop());
};
zoomSlider.oninput = () => setZoom(+zoomSlider.value / 100);
zoomInBtn.onclick = () => setZoom(zoom + 0.05);
zoomOutBtn.onclick = () => setZoom(zoom - 0.05);
zoomResetBtn.onclick = () => setZoom(1);
workspace.addEventListener(
  "wheel",
  (e) => {
    if (!e.altKey && !e.ctrlKey && !eventHasFn(e)) return;
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.03 : -0.03));
  },
  { passive: false },
);
workspace.addEventListener(
  "mousedown",
  (e) => {
    if (e.target === workspace) {
      commitTextLayer();
      commitPasteLayer();
      hideSelection();
    }
  },
  true,
);
window.paintBridge?.onFnZoomState?.((isDown) => {
  fnZoomDown = isDown;
});
window.addEventListener("keydown", (e) => updateFnZoomState(e, true), true);
window.addEventListener("keyup", (e) => updateFnZoomState(e, false), true);
window.addEventListener("blur", () => {
  fnZoomDown = false;
});
window.addEventListener("paste", (e) => {
  const file = [...(e.clipboardData?.files || [])].find((f) =>
    f.type.startsWith("image/"),
  );
  if (file) {
    e.preventDefault();
    pasteImageFile(file);
  }
});
workspace.addEventListener("dragenter", (e) => {
  e.preventDefault();
  e.stopPropagation();
  workspace.classList.add("drag-over");
});
workspace.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  workspace.classList.add("drag-over");
});
workspace.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.relatedTarget && workspace.contains(e.relatedTarget)) return;
  workspace.classList.remove("drag-over");
});
workspace.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  workspace.classList.remove("drag-over");
  const file = [...(e.dataTransfer?.files || [])].find((f) =>
    f.type.startsWith("image/"),
  );
  if (file) {
    if (currentFilePath) dropImageAsLayer(file, e);
    else loadImageFromFile(file);
  }
});
const ARROW_DIR = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const arrowHeld = new Set();
let arrowHoldStarted = 0;
let arrowLastTick = 0;
let arrowAccX = 0;
let arrowAccY = 0;
let arrowRaf = 0;
let arrowShift = false;

function arrowSpeedPxPerSec() {
  const heldMs = performance.now() - arrowHoldStarted;
  if (heldMs < 280) return arrowShift ? 180 : 70;
  if (heldMs < 700) return arrowShift ? 420 : 220;
  if (heldMs < 1400) return arrowShift ? 780 : 480;
  return arrowShift ? 1400 : 900;
}

function tickArrowMove(now) {
  arrowRaf = 0;
  if (!arrowHeld.size) return;
  if (!pasteLayer && !selection) {
    stopAllArrowHold();
    return;
  }
  const dt = Math.min(0.05, (now - arrowLastTick) / 1000);
  arrowLastTick = now;
  const speed = arrowSpeedPxPerSec();
  let vx = 0;
  let vy = 0;
  arrowHeld.forEach((key) => {
    const dir = ARROW_DIR[key];
    vx += dir[0];
    vy += dir[1];
  });
  arrowAccX += vx * speed * dt;
  arrowAccY += vy * speed * dt;
  const mx = arrowAccX > 0 ? Math.floor(arrowAccX) : Math.ceil(arrowAccX);
  const my = arrowAccY > 0 ? Math.floor(arrowAccY) : Math.ceil(arrowAccY);
  if (mx || my) {
    nudgeSelectedContent(mx, my);
    arrowAccX -= mx;
    arrowAccY -= my;
  }
  arrowRaf = requestAnimationFrame(tickArrowMove);
}

function startArrowHold(key, shiftKey) {
  const wasEmpty = arrowHeld.size === 0;
  arrowHeld.add(key);
  arrowShift = shiftKey;
  if (!wasEmpty) return;
  arrowHoldStarted = performance.now();
  arrowLastTick = arrowHoldStarted;
  arrowAccX = 0;
  arrowAccY = 0;
  const dir = ARROW_DIR[key];
  nudgeSelectedContent(dir[0] * (shiftKey ? 10 : 1), dir[1] * (shiftKey ? 10 : 1));
  arrowRaf = requestAnimationFrame(tickArrowMove);
}

function stopArrowHold(key) {
  arrowHeld.delete(key);
  if (arrowHeld.size) return;
  stopAllArrowHold();
}

function stopAllArrowHold() {
  arrowHeld.clear();
  if (arrowRaf) cancelAnimationFrame(arrowRaf);
  arrowRaf = 0;
  arrowAccX = 0;
  arrowAccY = 0;
}

window.addEventListener("keyup", (e) => {
  if (ARROW_DIR[e.key]) stopArrowHold(e.key);
});
window.addEventListener("blur", stopAllArrowHold);

window.onkeydown = async (e) => {
  if (isTextBarFocused()) return;
  if (e.key === "Escape" && !resizeDialog.classList.contains("hidden")) {
    closeResizeDialog();
    return;
  }
  if (e.key === "Escape" && !aboutDialog.classList.contains("hidden")) {
    closeAboutDialog();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    e.shiftKey ? saveAsFile() : saveFile();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") undoBtn.click();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") redoBtn.click();
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "+" || e.key === "=" || e.code === "Equal")
  ) {
    e.preventDefault();
    setZoom(zoom + 0.05);
  }
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "-" ||
      e.key === "_" ||
      e.code === "Minus" ||
      e.code === "NumpadSubtract")
  ) {
    e.preventDefault();
    setZoom(zoom - 0.05);
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
    if (textLayer) {
      e.preventDefault();
      selectAllTextLayer();
      return;
    }
    e.preventDefault();
    hideSelection();
    setSelection(0, 0, canvas.width, canvas.height);
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
    e.preventDefault();
    copySelection();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
    e.preventDefault();
    copySelection(true);
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    e.preventDefault();
    if (!(await pasteFromSystemClipboard())) pasteSelection();
  }
  if (ARROW_DIR[e.key] && (pasteLayer || selection)) {
    e.preventDefault();
    if (!e.repeat) startArrowHold(e.key, e.shiftKey);
    return;
  }
  if (e.key === "Backspace" || e.key === "Delete") {
    if (isEditingTextLayer()) return;
    e.preventDefault();
    deleteActiveSelection();
  }
  if (e.key === "Escape") {
    removeTextLayer();
    removePasteLayer();
    hideSelection();
    updateTextContextBar();
  }
};
function initCanvasView() {
  const ww = workspace.clientWidth;
  const wh = workspace.clientHeight;
  if (ww < 50 || wh < 50) {
    requestAnimationFrame(initCanvasView);
    return;
  }
  setZoom(1);
  centerCanvasInWorkspace();
  updateInfo();
}

window.paintBridge?.onOpenImageFile?.(openImageMeta);
window.paintBridge?.onMenuOpenImage?.(openImage);
window.paintBridge?.notifyRendererReady?.();

renderSwatches();
initTheme();
initSelectionHandles();
setupCanvasContext(ctx);
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
setResizeMode("percent");
setTool("select");
initCanvasView();
