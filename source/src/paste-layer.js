function removePasteLayer() {
  if (pasteLayer?.el) pasteLayer.el.remove();
  pasteLayer = null;
}
function clippedInset(x, y, w, h) {
  return `inset(${Math.max(0, -y)}px ${Math.max(0, x + w - canvas.width)}px ${Math.max(0, y + h - canvas.height)}px ${Math.max(0, -x)}px)`;
}
function positionPasteLayer() {
  if (!pasteLayer) return;
  pasteLayer.el.style.left = `${pasteLayer.x}px`;
  pasteLayer.el.style.top = `${pasteLayer.y}px`;
  pasteLayer.el.style.width = `${pasteLayer.w}px`;
  pasteLayer.el.style.height = `${pasteLayer.h}px`;
  pasteLayer.el.style.clipPath = clippedInset(
    pasteLayer.x,
    pasteLayer.y,
    pasteLayer.w,
    pasteLayer.h,
  );
}
function commitPasteLayer() {
  if (!pasteLayer) return;
  ctx.drawImage(
    pasteLayer.canvas,
    pasteLayer.x,
    pasteLayer.y,
    pasteLayer.w,
    pasteLayer.h,
  );
  removePasteLayer();
  updateInfo();
}
function redrawPasteLayer() {
  const c = pasteLayer.canvas;
  const sw = pasteLayer.sourceW ?? pasteLayer.source.width;
  const sh = pasteLayer.sourceH ?? pasteLayer.source.height;
  c.width = pasteLayer.w;
  c.height = pasteLayer.h;
  const cctx = c.getContext("2d");
  setupCanvasContext(cctx);
  cctx.clearRect(0, 0, c.width, c.height);
  if (pasteLayer.w === sw && pasteLayer.h === sh) {
    cctx.drawImage(pasteLayer.source, 0, 0);
    return;
  }
  let tmp = pasteLayer.source;
  while (tmp.width * 0.5 > c.width && tmp.height * 0.5 > c.height) {
    const step = document.createElement("canvas");
    step.width = Math.max(c.width, Math.floor(tmp.width * 0.5));
    step.height = Math.max(c.height, Math.floor(tmp.height * 0.5));
    const stepCtx = step.getContext("2d");
    setupCanvasContext(stepCtx);
    stepCtx.drawImage(tmp, 0, 0, step.width, step.height);
    tmp = step;
  }
  cctx.drawImage(tmp, 0, 0, c.width, c.height);
}
function addPasteResizeHandles(layer) {
  ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach((corner) => {
    const h = document.createElement("div");
    h.className = `paste-resize-handle ${corner}`;
    h.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      pasteResize = {
        corner,
        startX: e.clientX,
        startY: e.clientY,
        x: pasteLayer.x,
        y: pasteLayer.y,
        w: pasteLayer.w,
        h: pasteLayer.h,
      };
    };
    layer.appendChild(h);
  });
}
function createMovableLayer(source, x = 0, y = 0, message = "") {
  commitTextLayer();
  removePasteLayer();
  const layer = document.createElement("div");
  layer.className = "paste-layer";
  const c = document.createElement("canvas");
  layer.appendChild(c);
  pasteLayer = {
    el: layer,
    canvas: c,
    source,
    sourceW: source.width,
    sourceH: source.height,
    x,
    y,
    w: source.width,
    h: source.height,
    drag: false,
    dx: 0,
    dy: 0,
  };
  redrawPasteLayer();
  addPasteResizeHandles(layer);
  layer.onmousedown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const p = getShellMousePos(e);
    pasteLayer.drag = true;
    pasteLayer.dx = p.x - pasteLayer.x;
    pasteLayer.dy = p.y - pasteLayer.y;
  };
  shell.appendChild(layer);
  positionPasteLayer();
  if (message) showToast(message);
}
function addPasteLayerAt(source, x, y, expand = true) {
  commitTextLayer();
  if (expand) {
    expandCanvasTo(
      Math.max(canvas.width, x + source.width),
      Math.max(canvas.height, y + source.height),
    );
  }
  pushUndo();
  createMovableLayer(source, x, y);
}

function addPasteLayer(img) {
  addPasteLayerAt(img, 0, 0, true);
  fitRectToWorkspace(
    Math.max(canvas.width, img.width),
    Math.max(canvas.height, img.height),
  );
}

function dropImageAsLayer(file, e) {
  if (!file?.type?.startsWith("image/")) return false;
  commitPasteLayer();
  commitTextLayer();
  const img = new Image();
  img.onload = () => {
    const r = canvas.getBoundingClientRect();
    const cx = (e.clientX - r.left) * (canvas.width / r.width);
    const cy = (e.clientY - r.top) * (canvas.height / r.height);
    const x = Math.round(cx - img.width / 2);
    const y = Math.round(cy - img.height / 2);
    addPasteLayerAt(img, x, y, false);
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => showToast("Could not add image.");
  img.src = URL.createObjectURL(file);
  return true;
}
function pasteImageFile(file) {
  const img = new Image();
  img.onload = () => addPasteLayer(img);
  img.src = URL.createObjectURL(file);
}
async function pasteFromSystemClipboard() {
  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          pasteImageFile(await item.getType(type));
          return true;
        }
      }
    }
  } catch (_e) {}
  return false;
}
