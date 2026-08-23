function removeTextLayer() {
  if (textLayer?.el) textLayer.el.remove();
  textLayer = null;
}

function getFontSize() {
  return Math.max(8, +(fontSize?.value || 22));
}

function getTextAlign() {
  if (fontAlignCenter?.classList.contains("active")) return "center";
  if (fontAlignRight?.classList.contains("active")) return "right";
  return "left";
}

function getTextDecoration() {
  const parts = [];
  if (isFontUnderline()) parts.push("underline");
  if (isFontStrikethrough()) parts.push("line-through");
  return parts.length ? parts.join(" ") : "none";
}

function textLayerFont() {
  const style = isFontItalic() ? "italic" : "normal";
  const weight = isFontBold() ? "bold" : "normal";
  return `${style} ${weight} ${getFontSize()}px ${fontFamily.value}`;
}

function saveTextLayerCaret() {
  if (!textLayer?.editor) return null;
  const sel = window.getSelection();
  if (!sel?.rangeCount || !textLayer.editor.contains(sel.anchorNode)) return null;
  const range = sel.getRangeAt(0);
  const pre = range.cloneRange();
  pre.selectNodeContents(textLayer.editor);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

function restoreTextLayerCaret(offset) {
  if (!textLayer?.editor || offset == null) return;
  const editor = textLayer.editor;
  editor.focus();
  const range = document.createRange();
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  let remaining = offset;
  while (node) {
    const len = node.textContent.length;
    if (remaining <= len) {
      range.setStart(node, remaining);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    remaining -= len;
    node = walker.nextNode();
  }
  range.selectNodeContents(editor);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function isTextBarFocused() {
  const active = document.activeElement;
  return !!(active && textContextBar?.contains(active));
}

function updateTextLayerStyle() {
  if (!textLayer) return;
  const editor = textLayer.editor;
  const caret = saveTextLayerCaret();
  const text = editor.innerText.replace(/\n$/, "");
  editor.textContent = text;
  const size = getFontSize();
  editor.style.font = textLayerFont();
  editor.style.color = colorPicker.value;
  editor.style.fontStyle = isFontItalic() ? "italic" : "normal";
  editor.style.fontWeight = isFontBold() ? "bold" : "normal";
  editor.style.fontSize = `${size}px`;
  editor.style.fontFamily = fontFamily.value;
  editor.style.textDecoration = getTextDecoration();
  editor.style.textAlign = getTextAlign();
  editor.style.background = fontBackgroundFill?.checked
    ? secondaryColor.value
    : "transparent";
  if (!isTextBarFocused()) {
    restoreTextLayerCaret(caret ?? text.length);
  }
  positionTextLayer();
}

function positionTextLayer() {
  if (!textLayer) return;
  textLayer.el.style.left = `${textLayer.x}px`;
  textLayer.el.style.top = `${textLayer.y}px`;
}

function createTextLayer(x, y) {
  commitPasteLayer();
  commitTextLayer();
  const layer = document.createElement("div");
  layer.className = "text-layer";
  const moveHandle = document.createElement("div");
  moveHandle.className = "text-layer-move";
  moveHandle.title = "Move text";
  const editor = document.createElement("div");
  editor.className = "text-layer-editor";
  editor.contentEditable = "true";
  editor.spellcheck = false;
  layer.appendChild(moveHandle);
  layer.appendChild(editor);
  textLayer = {
    el: layer,
    editor,
    x: Math.round(x),
    y: Math.round(y),
    drag: false,
    dx: 0,
    dy: 0,
  };
  const startDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    textLayer.drag = true;
    const r = shell.getBoundingClientRect();
    textLayer.dx = (e.clientX - r.left) / zoom - textLayer.x;
    textLayer.dy = (e.clientY - r.top) / zoom - textLayer.y;
  };
  moveHandle.onmousedown = startDrag;
  layer.onmousedown = (e) => {
    if (e.target === editor) return;
    startDrag(e);
  };
  editor.onmousedown = (e) => e.stopPropagation();
  updateTextLayerStyle();
  shell.appendChild(layer);
  positionTextLayer();
  updateTextContextBar();
  requestAnimationFrame(() => editor.focus());
}

function drawCommittedTextLine(line, x, y, size) {
  ctx.fillText(line, x, y);
  const width = ctx.measureText(line).width;
  if (isFontUnderline()) {
    ctx.beginPath();
    ctx.moveTo(x, y + size + 1);
    ctx.lineTo(x + width, y + size + 1);
    ctx.stroke();
  }
  if (isFontStrikethrough()) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.lineTo(x + width, y + size * 0.55);
    ctx.stroke();
  }
}

function commitTextLayer() {
  if (!textLayer) return;
  const text = textLayer.editor.innerText.replace(/\n$/, "");
  if (text.trim()) {
    pushUndo();
    const size = getFontSize();
    const align = getTextAlign();
    const boxW = Math.max(textLayer.editor.offsetWidth, 8);
    const lines = text.split("\n");
    const lineHeight = size * 1.2;
    const blockH = lines.length * lineHeight;

    ctx.font = textLayerFont();
    ctx.textBaseline = "top";
    ctx.textAlign = align;
    ctx.fillStyle = colorPicker.value;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = Math.max(1, size / 14);

    if (fontBackgroundFill?.checked) {
      ctx.fillStyle = secondaryColor.value;
      ctx.fillRect(textLayer.x, textLayer.y, boxW, blockH + 2);
      ctx.fillStyle = colorPicker.value;
    }

    lines.forEach((line, index) => {
      const y = textLayer.y + index * lineHeight;
      let x = textLayer.x;
      if (align === "center") x += boxW / 2;
      else if (align === "right") x += boxW;
      drawCommittedTextLine(line, x, y, size);
    });

    ctx.textAlign = "left";
  }
  removeTextLayer();
  updateTextContextBar();
  updateInfo();
}

function updateTextContextBar() {
  textContextBar?.classList.toggle(
    "visible",
    tool === "text" || !!textLayer,
  );
}

function isEditingTextLayer() {
  return !!(textLayer?.editor && document.activeElement === textLayer.editor);
}

function selectAllTextLayer() {
  if (!textLayer?.editor) return false;
  const editor = textLayer.editor;
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

function setTextAlign(align) {
  fontAlignLeft?.classList.toggle("active", align === "left");
  fontAlignCenter?.classList.toggle("active", align === "center");
  fontAlignRight?.classList.toggle("active", align === "right");
  updateTextLayerStyle();
}

function toggleFontStyle(btn) {
  btn?.classList.toggle("active");
  updateTextLayerStyle();
  updateInfo();
}
