function hexFromPixel(x, y) {
  const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return (
    "#" +
    [p[0], p[1], p[2]].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
}
function hexToRgba(h) {
  const c = h.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
    255,
  ];
}
function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function floodFill(x, y, c) {
  x = Math.floor(x);
  y = Math.floor(y);
  const im = ctx.getImageData(0, 0, canvas.width, canvas.height),
    d = im.data,
    ti = (y * canvas.width + x) * 4,
    t = d.slice(ti, ti + 4),
    f = hexToRgba(c);
  if (colorsMatch(t, f)) return;
  const st = [[x, y]];
  while (st.length) {
    const [cx, cy] = st.pop();
    if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue;
    const i = (cy * canvas.width + cx) * 4;
    if (!colorsMatch(d.slice(i, i + 4), t)) continue;
    d[i] = f[0];
    d[i + 1] = f[1];
    d[i + 2] = f[2];
    d[i + 3] = 255;
    st.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(im, 0, 0);
}
