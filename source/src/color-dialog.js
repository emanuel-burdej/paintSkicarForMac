let colorPanelTarget = null;
let colorPanelH = 0;
let colorPanelS = 0;
let colorPanelV = 0;
let colorPanelMode = "hex";
let colorSvDragging = false;
let colorHueDragging = false;

function normalizeHex(value) {
  let c = String(value || "")
    .trim()
    .replace(/^#/, "")
    .toLowerCase();
  if (/^[0-9a-f]{3}$/.test(c)) {
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (!/^[0-9a-f]{6}$/.test(c)) return null;
  return `#${c}`;
}

function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function currentPanelHex() {
  const { r, g, b } = hsvToRgb(colorPanelH, colorPanelS, colorPanelV);
  return rgbToHex(r, g, b);
}

async function copyColorToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (_e2) {
      return false;
    }
  }
}

function setColorPanelMode(mode) {
  colorPanelMode = mode === "rgb" ? "rgb" : "hex";
  colorHexFields.classList.toggle("hidden", colorPanelMode !== "hex");
  colorRgbFields.classList.toggle("hidden", colorPanelMode !== "rgb");
  syncColorPanelInputs();
}

function syncColorPanelInputs() {
  const hex = currentPanelHex();
  const { r, g, b } = hexToRgb(hex);
  colorPreview.style.background = hex;
  colorHexInput.value = hex.toUpperCase();
  colorRInput.value = String(r);
  colorGInput.value = String(g);
  colorBInput.value = String(b);
  const hueRgb = hsvToRgb(colorPanelH, 1, 1);
  const hueHex = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);
  colorSvArea.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueHex})`;
  colorSvCursor.style.left = `${colorPanelS * 100}%`;
  colorSvCursor.style.top = `${(1 - colorPanelV) * 100}%`;
  colorHueThumb.style.left = `${(colorPanelH / 360) * 100}%`;
  colorHueThumb.style.background = hueHex;
}

function applyPanelToTarget() {
  if (!colorPanelTarget) return;
  colorPanelTarget.value = currentPanelHex();
  updateTextLayerStyle();
  updateInfo();
}

function positionColorPanel(anchor) {
  const rect = anchor.getBoundingClientRect();
  const panelW = 236;
  const panelH = 320;
  let left = rect.left;
  let top = rect.bottom + 8;
  if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
  if (left < 8) left = 8;
  if (top + panelH > window.innerHeight - 8) top = Math.max(8, rect.top - panelH - 8);
  colorPanel.style.left = `${left}px`;
  colorPanel.style.top = `${top}px`;
}

function openColorPanel(input) {
  colorPanelTarget = input;
  const { r, g, b } = hexToRgb(input.value || "#000000");
  const hsv = rgbToHsv(r, g, b);
  colorPanelH = hsv.h;
  colorPanelS = hsv.s;
  colorPanelV = hsv.v;
  setColorPanelMode("hex");
  syncColorPanelInputs();
  positionColorPanel(input);
  colorPanel.classList.remove("hidden");
  colorPanel.setAttribute("aria-hidden", "false");
}

function closeColorPanel() {
  colorPanel.classList.add("hidden");
  colorPanel.setAttribute("aria-hidden", "true");
  colorPanelTarget = null;
  colorSvDragging = false;
  colorHueDragging = false;
}

function setSvFromEvent(e) {
  const rect = colorSvArea.getBoundingClientRect();
  colorPanelS = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  colorPanelV = Math.max(
    0,
    Math.min(1, 1 - (e.clientY - rect.top) / rect.height),
  );
  syncColorPanelInputs();
  applyPanelToTarget();
}

function setHueFromEvent(e) {
  const rect = colorHueBar.getBoundingClientRect();
  colorPanelH = Math.max(
    0,
    Math.min(359.999, ((e.clientX - rect.left) / rect.width) * 360),
  );
  syncColorPanelInputs();
  applyPanelToTarget();
}

function copyPanelColor() {
  const hex = currentPanelHex().toUpperCase();
  const { r, g, b } = hexToRgb(hex);
  const text = colorPanelMode === "rgb" ? `${r}, ${g}, ${b}` : hex;
  copyColorToClipboard(text).then((ok) => {
    showToast(ok ? `Copied ${text}` : "Copy failed");
  });
}

function applyHexToColorPanel(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsv = rgbToHsv(r, g, b);
  colorPanelH = hsv.h;
  colorPanelS = hsv.s;
  colorPanelV = hsv.v;
  syncColorPanelInputs();
  applyPanelToTarget();
}

async function runScreenEyeDropper() {
  if (!window.EyeDropper) return null;
  try {
    const result = await new window.EyeDropper().open();
    return normalizeHex(result.sRGBHex);
  } catch (_e) {
    return null;
  }
}

async function pickColorWithEyeDropper() {
  if (!window.EyeDropper) {
    showToast("Eyedropper not available");
    return null;
  }
  const hex = await runScreenEyeDropper();
  if (!hex) return null;
  if (!colorPanel.classList.contains("hidden") && colorPanelTarget) {
    applyHexToColorPanel(hex);
  } else {
    colorPicker.value = hex;
    updateTextLayerStyle();
    updateInfo();
  }
  return hex;
}

async function pickColorWithToolEyeDropper() {
  if (!window.EyeDropper) return false;
  const hex = await runScreenEyeDropper();
  if (!hex) return false;
  colorPicker.value = hex;
  if (!colorPanel.classList.contains("hidden") && colorPanelTarget === colorPicker) {
    applyHexToColorPanel(hex);
  }
  updateTextLayerStyle();
  updateInfo();
  const ok = await copyColorToClipboard(hex);
  showToast(ok ? `Copied ${hex}` : `Color picked: ${hex}`);
  return true;
}

function bindColorWell(input) {
  const open = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!colorPanel.classList.contains("hidden") && colorPanelTarget === input) {
      closeColorPanel();
      return;
    }
    openColorPanel(input);
  };
  input.addEventListener("click", open);
  input.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

colorModeCycleBtn.onclick = () =>
  setColorPanelMode(colorPanelMode === "hex" ? "rgb" : "hex");
colorCopyBtn.onclick = copyPanelColor;
colorEyeDropperBtn.onclick = pickColorWithEyeDropper;

colorHexInput.oninput = () => {
  const hex = normalizeHex(colorHexInput.value);
  if (!hex) return;
  const { r, g, b } = hexToRgb(hex);
  const hsv = rgbToHsv(r, g, b);
  colorPanelH = hsv.h;
  colorPanelS = hsv.s;
  colorPanelV = hsv.v;
  syncColorPanelInputs();
  applyPanelToTarget();
};

function onRgbInputChange() {
  const r = Math.max(0, Math.min(255, +colorRInput.value || 0));
  const g = Math.max(0, Math.min(255, +colorGInput.value || 0));
  const b = Math.max(0, Math.min(255, +colorBInput.value || 0));
  const hsv = rgbToHsv(r, g, b);
  colorPanelH = hsv.h;
  colorPanelS = hsv.s;
  colorPanelV = hsv.v;
  syncColorPanelInputs();
  applyPanelToTarget();
}

colorRInput.oninput = onRgbInputChange;
colorGInput.oninput = onRgbInputChange;
colorBInput.oninput = onRgbInputChange;

colorSvArea.onmousedown = (e) => {
  e.preventDefault();
  colorSvDragging = true;
  setSvFromEvent(e);
};
colorHueBar.onmousedown = (e) => {
  e.preventDefault();
  colorHueDragging = true;
  setHueFromEvent(e);
};

window.addEventListener("mousemove", (e) => {
  if (colorSvDragging) setSvFromEvent(e);
  if (colorHueDragging) setHueFromEvent(e);
});
window.addEventListener("mouseup", () => {
  colorSvDragging = false;
  colorHueDragging = false;
});

document.addEventListener(
  "mousedown",
  (e) => {
    if (colorPanel.classList.contains("hidden")) return;
    if (colorPanel.contains(e.target)) return;
    if (e.target === colorPicker || e.target === secondaryColor) return;
    closeColorPanel();
  },
  true,
);

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (colorPanel.classList.contains("hidden")) return;
  e.preventDefault();
  closeColorPanel();
});

bindColorWell(colorPicker);
bindColorWell(secondaryColor);
