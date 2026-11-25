/* Hearth & Ledger — charts. One job: draw the donut and bar charts on
   <canvas>, with plain 2D drawing and no library, so the first load stays
   tiny and works offline. */
export function drawDonut(canvas, slices) {
  const dpr = window.devicePixelRatio || 1;
  const size = 190;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outer = 88;
  const inner = 58;
  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fillStyle = '#ece7db';
    ctx.fill();
  } else {
    let start = -Math.PI / 2;
    for (const slice of slices) {
      const sweep = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outer, start, start + sweep);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      start += sweep;
    }
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

export function drawBars(canvas, rows, maxValue) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 640;
  const barHeight = 26;
  const gap = 14;
  const labelWidth = 86;
  const height = rows.length * (barHeight + gap) + 8;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.font = '13px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  const max = Math.max(maxValue, ...rows.map((r) => r.value), 1);
  rows.forEach((row, i) => {
    const y = 8 + i * (barHeight + gap);
    ctx.fillStyle = '#22302a';
    ctx.fillText(row.label, 0, y + barHeight / 2);
    const trackX = labelWidth;
    const trackW = width - labelWidth - 64;
    ctx.fillStyle = '#ece7db';
    roundRect(ctx, trackX, y, trackW, barHeight, 6);
    ctx.fill();
    const fillW = Math.max(4, (row.value / max) * trackW);
    ctx.fillStyle = row.color;
    roundRect(ctx, trackX, y, fillW, barHeight, 6);
    ctx.fill();
    ctx.fillStyle = '#22302a';
    ctx.fillText(row.text, trackX + trackW + 8, y + barHeight / 2);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
