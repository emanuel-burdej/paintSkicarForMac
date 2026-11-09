const TOOL_CURSOR_INNER = {
  brush: `<path fill="#FFCC00" stroke="#1a1a1a" stroke-width="0.5" stroke-linejoin="round" d="M30.133 1.552c-1.090-1.044-2.291-1.573-3.574-1.573-2.006 0-3.47 1.296-3.87 1.693-0.564 0.558-19.786 19.788-19.786 19.788-0.126 0.126-0.217 0.284-0.264 0.456-0.433 1.602-2.605 8.71-2.627 8.782-0.112 0.364-0.012 0.761 0.256 1.029 0.193 0.192 0.45 0.295 0.713 0.295 0.104 0 0.208-0.016 0.31-0.049 0.073-0.024 7.41-2.395 8.618-2.756 0.159-0.048 0.305-0.134 0.423-0.251 0.763-0.754 18.691-18.483 19.881-19.712 1.231-1.268 1.843-2.59 1.819-3.925-0.025-1.319-0.664-2.589-1.901-3.776z"/><path fill="#FFCC00" d="M22.37 4.87c0.509 0.123 1.711 0.527 2.938 1.765 1.24 1.251 1.575 2.681 1.638 3.007-3.932 3.912-12.983 12.867-16.551 16.396-0.329-0.767-0.862-1.692-1.719-2.555-1.046-1.054-2.111-1.649-2.932-1.984 3.531-3.532 12.753-12.757 16.625-16.628z"/><path fill="#F69B9B" stroke="#1a1a1a" stroke-width="0.35" stroke-linejoin="round" d="M28.763 7.824c-0.041 0.042-0.109 0.11-0.19 0.192-0.316-0.814-0.87-1.86-1.831-2.828-0.981-0.989-1.976-1.572-2.773-1.917 0.068-0.067 0.12-0.12 0.141-0.14 0.114-0.113 1.153-1.106 2.447-1.106 0.745 0 1.477 0.34 2.175 1.010 0.828 0.795 1.256 1.579 1.27 2.331 0.014 0.768-0.404 1.595-1.24 2.458z"/><path fill="#1a1a1a" d="M4.387 23.186c0.55 0.146 1.691 0.57 2.854 1.742 0.896 0.904 1.319 1.9 1.509 2.508-1.39 0.447-4.434 1.497-6.367 2.121 0.573-1.886 1.541-4.822 2.004-6.371z"/>`,
  fill: `<path d="M7.00914 17.9998L2.99914 13.9898C1.65914 12.6498 1.65914 11.3198 2.99914 9.9798L9.67914 3.2998L17.0291 10.6498C17.3991 11.0198 17.3991 11.6198 17.0291 11.9898L11.0091 18.0098C9.68914 19.3298 8.34914 19.3298 7.00914 17.9998Z" stroke="#A8BFD4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8.34961 1.9502L9.68961 3.29016" stroke="#9CB4CC" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path opacity="0.55" d="M2.07031 11.9197L17.1903 11.2598" stroke="#C5D4E3" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 22H16" stroke="#8E9EAE" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" fill="none"/><path opacity="0.9" d="M18.85 15C18.85 15 17 17.01 17 18.24C17 19.26 17.83 20.09 18.85 20.09C19.87 20.09 20.7 19.26 20.7 18.24C20.7 17.01 18.85 15 18.85 15Z" stroke="#E66B3B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  eraser: `<path d="M5.50506 11.4096L6.03539 11.9399L5.50506 11.4096ZM3 14.9522H2.25H3ZM12.5904 18.4949L12.0601 17.9646L12.5904 18.4949ZM9.04776 21V21.75V21ZM11.4096 5.50506L10.8792 4.97473L11.4096 5.50506ZM13.241 17.8444C13.5339 18.1373 14.0088 18.1373 14.3017 17.8444C14.5946 17.5515 14.5946 17.0766 14.3017 16.7837L13.241 17.8444ZM7.21629 9.69832C6.9234 9.40543 6.44852 9.40543 6.15563 9.69832C5.86274 9.99122 5.86274 10.4661 6.15563 10.759L7.21629 9.69832ZM16.073 16.073C16.3659 15.7801 16.3659 15.3053 16.073 15.0124C15.7801 14.7195 15.3053 14.7195 15.0124 15.0124L16.073 16.073ZM18.4676 11.5559C18.1759 11.8499 18.1777 12.3248 18.4718 12.6165C18.7658 12.9083 19.2407 12.9064 19.5324 12.6124L18.4676 11.5559ZM6.03539 11.9399L11.9399 6.03539L10.8792 4.97473L4.97473 10.8792L6.03539 11.9399ZM6.03539 17.9646C5.18538 17.1146 4.60235 16.5293 4.22253 16.0315C3.85592 15.551 3.75 15.2411 3.75 14.9522H2.25C2.25 15.701 2.56159 16.3274 3.03 16.9414C3.48521 17.538 4.1547 18.2052 4.97473 19.0253L6.03539 17.9646ZM4.97473 10.8792C4.1547 11.6993 3.48521 12.3665 3.03 12.9631C2.56159 13.577 2.25 14.2035 2.25 14.9522H3.75C3.75 14.6633 3.85592 14.3535 4.22253 13.873C4.60235 13.3752 5.18538 12.7899 6.03539 11.9399L4.97473 10.8792ZM12.0601 17.9646C11.2101 18.8146 10.6248 19.3977 10.127 19.7775C9.64651 20.1441 9.33665 20.25 9.04776 20.25V21.75C9.79649 21.75 10.423 21.4384 11.0369 20.97C11.6335 20.5148 12.3008 19.8453 13.1208 19.0253L12.0601 17.9646ZM4.97473 19.0253C5.79476 19.8453 6.46201 20.5148 7.05863 20.97C7.67256 21.4384 8.29902 21.75 9.04776 21.75V20.25C8.75886 20.25 8.449 20.1441 7.9685 19.7775C7.47069 19.3977 6.88541 18.8146 6.03539 17.9646L4.97473 19.0253ZM17.9646 6.03539C18.8146 6.88541 19.3977 7.47069 19.7775 7.9685C20.1441 8.449 20.25 8.75886 20.25 9.04776H21.75C21.75 8.29902 21.4384 7.67256 20.97 7.05863C20.5148 6.46201 19.8453 5.79476 19.0253 4.97473L17.9646 6.03539ZM19.0253 4.97473C18.2052 4.1547 17.538 3.48521 16.9414 3.03C16.3274 2.56159 15.701 2.25 14.9522 2.25V3.75C15.2411 3.75 15.551 3.85592 16.0315 4.22253C16.5293 4.60235 17.1146 5.18538 17.9646 6.03539L19.0253 4.97473ZM11.9399 6.03539C12.7899 5.18538 13.3752 4.60235 13.873 4.22253C14.3535 3.85592 14.6633 3.75 14.9522 3.75V2.25C14.2035 2.25 13.577 2.56159 12.9631 3.03C12.3665 3.48521 11.6993 4.1547 10.8792 4.97473L11.9399 6.03539ZM14.3017 16.7837L7.21629 9.69832L6.15563 10.759L13.241 17.8444L14.3017 16.7837ZM15.0124 15.0124L12.0601 17.9646L13.1208 19.0253L16.073 16.073L15.0124 15.0124ZM19.5324 12.6124C20.1932 11.9464 20.7384 11.3759 21.114 10.8404C21.5023 10.2869 21.75 9.71511 21.75 9.04776H20.25C20.25 9.30755 20.1644 9.58207 19.886 9.979C19.5949 10.394 19.1401 10.8781 18.4676 11.5559L19.5324 12.6124Z" fill="#F69B9B"/><path d="M9 21H21" stroke="#E58A8A" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
};

const TOOL_CURSOR_VIEW = {
  brush: { box: "0 0 32 32", size: 20, hotX: 2, hotY: 18 },
  fill: { box: "0 0 24 24", size: 20, hotX: 3, hotY: 3 },
  eraser: { box: "0 0 24 24", size: 20, hotX: 3, hotY: 17 },
};

function cursorUrl(svg, x, y, fallback) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;
}

function toolCursorSvg(name) {
  const meta = TOOL_CURSOR_VIEW[name];
  const inner = TOOL_CURSOR_INNER[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.size}" height="${meta.size}" viewBox="${meta.box}">${inner}</svg>`;
}

function cursorForTool(name) {
  if (name === "brush" || name === "fill" || name === "eraser") {
    const meta = TOOL_CURSOR_VIEW[name];
    const fallback = name === "fill" ? "cell" : "crosshair";
    return cursorUrl(toolCursorSvg(name), meta.hotX, meta.hotY, fallback);
  }
  if (name === "picker") return "copy";
  if (name === "text") return "text";
  return "crosshair";
}

function setTool(t) {
  if (calloutDraft) commitCalloutDraft(true);
  commitTextLayer();
  commitPasteLayer();
  tool = t;
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) => b.classList.toggle("active", b.dataset.tool === tool));
  canvas.style.cursor = cursorForTool(tool);
  updateTextContextBar();
  updateInfo();
  if (tool === "picker") {
    setTimeout(() => {
      if (tool !== "picker") return;
      pickColorWithToolEyeDropper();
    }, 0);
  }
}
function drawLine(x1, y1, x2, y2) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = +brushSize.value;
  ctx.strokeStyle =
    tool === "eraser" ? secondaryColor.value : colorPicker.value;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function regularPolygon(cx, cy, rx, ry, sides, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * 2 * Math.PI) / sides,
      x = cx + Math.cos(a) * rx,
      y = cy + Math.sin(a) * ry;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function starPath(cx, cy, rx, ry) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.45 : 1,
      a = -Math.PI / 2 + (i * Math.PI) / 5,
      x = cx + Math.cos(a) * rx * r,
      y = cy + Math.sin(a) * ry * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function strokeOrFill() {
  if (fillShape.checked) ctx.fill();
  ctx.stroke();
}
function drawShape(x1, y1, x2, y2, k) {
  const w = x2 - x1,
    h = y2 - y1,
    cx = x1 + w / 2,
    cy = y1 + h / 2;
  ctx.lineWidth = +brushSize.value;
  ctx.strokeStyle = colorPicker.value;
  ctx.fillStyle = secondaryColor.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (k === "line") {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }
  if (k === "curve") {
    ctx.moveTo(x1, y2);
    ctx.quadraticCurveTo(cx, y1, x2, y2);
    ctx.stroke();
    return;
  }
  if (k === "rect") {
    ctx.rect(x1, y1, w, h);
    strokeOrFill();
    return;
  }
  if (k === "roundrect") {
    const r = Math.min(Math.abs(w), Math.abs(h), 36) / 4;
    ctx.roundRect(x1, y1, w, h, r);
    strokeOrFill();
    return;
  }
  if (k === "ellipse") {
    ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
    strokeOrFill();
    return;
  }
  if (k === "triangle") {
    ctx.moveTo(cx, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    strokeOrFill();
    return;
  }
  if (k === "righttri") {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    strokeOrFill();
    return;
  }
  if (k === "diamond") {
    ctx.moveTo(cx, y1);
    ctx.lineTo(x2, cy);
    ctx.lineTo(cx, y2);
    ctx.lineTo(x1, cy);
    ctx.closePath();
    strokeOrFill();
    return;
  }
  if (k === "pentagon") {
    regularPolygon(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 5);
    strokeOrFill();
    return;
  }
  if (k === "hexagon") {
    regularPolygon(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 6, Math.PI / 6);
    strokeOrFill();
    return;
  }
  if (k === "star") {
    starPath(cx, cy, Math.abs(w / 2), Math.abs(h / 2));
    strokeOrFill();
    return;
  }
  if (k === "arrow") {
    const a = Math.atan2(y2 - y1, x2 - x1),
      head = Math.max(12, +brushSize.value * 3);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(a - Math.PI / 6),
      y2 - head * Math.sin(a - Math.PI / 6),
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(a + Math.PI / 6),
      y2 - head * Math.sin(a + Math.PI / 6),
    );
    ctx.stroke();
  }
  if (k === "callout") {
    const snapped = snapCalloutEnd(x1, y1, x2, y2);
    drawCallout(x1, y1, snapped.x, snapped.y, "");
  }
}

function peekCalloutLabel() {
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return labels[calloutSeq % labels.length];
}

function advanceCalloutLabel(used) {
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const idx = labels.indexOf(String(used || "").toUpperCase());
  calloutSeq = idx >= 0 ? idx + 1 : calloutSeq + 1;
}

function calloutSizes() {
  const ballR = Math.max(14, Math.round(+brushSize.value * 2.4));
  const tipR = Math.max(3, Math.round(ballR * 0.28));
  const lineW = Math.max(2, Math.round(+brushSize.value * 0.4));
  return { ballR, tipR, lineW };
}

function snapCalloutEnd(tipX, tipY, x, y) {
  const dx = x - tipX;
  const dy = y - tipY;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return { x, y };
  const angle = Math.atan2(dy, dx);
  const step = Math.PI / 4;
  const nearest = Math.round(angle / step) * step;
  let delta = angle - nearest;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) > (16 * Math.PI) / 180) return { x, y };
  return {
    x: tipX + Math.cos(nearest) * dist,
    y: tipY + Math.sin(nearest) * dist,
  };
}

function calloutDirtyRect(tipX, tipY, ballX, ballY) {
  const { ballR, tipR, lineW } = calloutSizes();
  const pad = ballR + tipR + lineW + 4;
  const x = Math.max(0, Math.floor(Math.min(tipX, ballX) - pad));
  const y = Math.max(0, Math.floor(Math.min(tipY, ballY) - pad));
  const right = Math.min(canvas.width, Math.ceil(Math.max(tipX, ballX) + pad));
  const bottom = Math.min(canvas.height, Math.ceil(Math.max(tipY, ballY) + pad));
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

function restoreCalloutDirty(bounds) {
  if (!snapshot || !bounds || bounds.w < 1 || bounds.h < 1) return;
  ctx.putImageData(snapshot, 0, 0, bounds.x, bounds.y, bounds.w, bounds.h);
}

function drawCallout(tipX, tipY, ballX, ballY, label) {
  const color = colorPicker.value;
  const { ballR, tipR, lineW } = calloutSizes();
  const dx = ballX - tipX;
  const dy = ballY - tipY;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const lineStartX = tipX + ux * tipR;
  const lineStartY = tipY + uy * tipR;
  const lineEndX = ballX - ux * ballR;
  const lineEndY = ballY - uy * ballR;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (dist > tipR + ballR + 2) {
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(tipX, tipY, tipR, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
  ctx.fill();

  if (label) {
    const text = String(label).slice(0, 2).toUpperCase();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(ballR * (text.length > 1 ? 0.95 : 1.15))}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, ballX, ballY + Math.max(0.5, ballR * 0.04));
  }
}

let calloutPreviewRaf = 0;
let calloutPreviewPoint = null;
let calloutPrevDirty = null;

function previewCalloutDrag(tipX, tipY, x, y) {
  calloutPreviewPoint = { tipX, tipY, x, y };
  if (calloutPreviewRaf) return;
  calloutPreviewRaf = requestAnimationFrame(() => {
    calloutPreviewRaf = 0;
    const p = calloutPreviewPoint;
    if (!p || !snapshot) return;
    const snapped = snapCalloutEnd(p.tipX, p.tipY, p.x, p.y);
    const nextDirty = calloutDirtyRect(p.tipX, p.tipY, snapped.x, snapped.y);
    let restore = nextDirty;
    if (calloutPrevDirty) {
      const x1 = Math.min(calloutPrevDirty.x, nextDirty.x);
      const y1 = Math.min(calloutPrevDirty.y, nextDirty.y);
      const x2 = Math.max(
        calloutPrevDirty.x + calloutPrevDirty.w,
        nextDirty.x + nextDirty.w,
      );
      const y2 = Math.max(
        calloutPrevDirty.y + calloutPrevDirty.h,
        nextDirty.y + nextDirty.h,
      );
      restore = {
        x: Math.max(0, x1),
        y: Math.max(0, y1),
        w: Math.max(0, Math.min(canvas.width, x2) - Math.max(0, x1)),
        h: Math.max(0, Math.min(canvas.height, y2) - Math.max(0, y1)),
      };
    }
    restoreCalloutDirty(restore);
    drawCallout(p.tipX, p.tipY, snapped.x, snapped.y, "");
    calloutPrevDirty = nextDirty;
  });
}

function resetCalloutPreviewState() {
  if (calloutPreviewRaf) {
    cancelAnimationFrame(calloutPreviewRaf);
    calloutPreviewRaf = 0;
  }
  calloutPreviewPoint = null;
  calloutPrevDirty = null;
}

function removeCalloutLabelInput() {
  if (calloutDraft?.input) calloutDraft.input.remove();
  calloutDraft = null;
}

function commitCalloutDraft(keep) {
  if (!calloutDraft) return;
  const { tipX, tipY, ballX, ballY, input, baseSnapshot } = calloutDraft;
  const label = keep
    ? (input?.value || "").trim().toUpperCase().slice(0, 2) || peekCalloutLabel()
    : "";
  if (baseSnapshot) ctx.putImageData(baseSnapshot, 0, 0);
  if (keep && label) {
    drawCallout(tipX, tipY, ballX, ballY, label);
    advanceCalloutLabel(label);
  } else if (!keep && undoStack.length) {
    undoStack.pop();
    updateHistoryButtons();
  }
  removeCalloutLabelInput();
  snapshot = null;
  updateInfo();
}

function beginCalloutLabel(tipX, tipY, ballX, ballY, baseSnapshot) {
  removeCalloutLabelInput();
  const { ballR } = calloutSizes();
  const input = document.createElement("input");
  input.className = "callout-label-input";
  input.type = "text";
  input.maxLength = 2;
  input.value = peekCalloutLabel();
  input.spellcheck = false;
  input.autocomplete = "off";
  const size = Math.max(22, ballR * 1.6);
  input.style.width = `${size}px`;
  input.style.height = `${size}px`;
  input.style.left = `${ballX - size / 2}px`;
  input.style.top = `${ballY - size / 2}px`;
  input.style.fontSize = `${Math.round(ballR * 1.05)}px`;
  input.style.background = colorPicker.value;
  calloutDraft = { tipX, tipY, ballX, ballY, input, baseSnapshot };
  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      commitCalloutDraft(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      commitCalloutDraft(false);
    }
  };
  input.onblur = () => {
    if (!calloutDraft || calloutDraft.input !== input) return;
    commitCalloutDraft(true);
  };
  shell.appendChild(input);
  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}
