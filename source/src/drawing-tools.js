function setTool(t) {
  commitTextLayer();
  commitPasteLayer();
  tool = t;
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) => b.classList.toggle("active", b.dataset.tool === tool));
  canvas.style.cursor =
    tool === "picker"
      ? "copy"
      : tool === "fill"
        ? "cell"
        : tool === "text"
          ? "text"
          : "crosshair";
  updateTextContextBar();
  updateInfo();
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
}
