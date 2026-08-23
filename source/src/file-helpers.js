function extFromName(n) {
  return n && n.includes(".") ? n.split(".").pop().toLowerCase() : "png";
}
function mimeFromExt(e) {
  return e === "jpg" || e === "jpeg"
    ? "image/jpeg"
    : e === "webp"
      ? "image/webp"
      : "image/png";
}
function outputName() {
  const b = currentFileName.replace(/\.[^.]+$/, "") || "Untitled";
  return `${b}.${currentExtension}`;
}
function base64For(type = currentMimeType) {
  commitTextLayer();
  commitPasteLayer();
  return canvas.toDataURL(type, type === "image/jpeg" ? 0.92 : 1).split(",")[1];
}
