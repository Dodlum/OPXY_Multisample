// Small DOM helpers and the waveform renderer.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === false || v === null || v === undefined) continue;
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatSeconds(s) {
  return s < 10 ? `${s.toFixed(2)} s` : `${s.toFixed(1)} s`;
}

// Draw a peak-envelope waveform of `channels` (mono-mixed) into a canvas, with
// optional markers: { loop: {start,end}, playhead: frame, trimmedFrom }.
export function drawWaveform(canvas, channels, markers = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const styles = getComputedStyle(canvas);
  const ink = styles.getPropertyValue('--ink').trim() || '#111';
  const accent = styles.getPropertyValue('--accent').trim() || '#ff5a00';
  const faint = styles.getPropertyValue('--line').trim() || '#ddd';

  if (!channels || !channels.length) return;
  const n = channels[0].length;
  const mid = h / 2;

  if (markers.loop) {
    const x0 = (markers.loop.start / n) * w;
    const x1 = (markers.loop.end / n) * w;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(x0, 0, x1 - x0, h);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = faint;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid + 0.5);
  ctx.lineTo(w, mid + 0.5);
  ctx.stroke();

  ctx.fillStyle = ink;
  const step = n / w;
  for (let x = 0; x < w; x++) {
    const a = Math.floor(x * step);
    const b = Math.min(n, Math.floor((x + 1) * step) + 1);
    let min = 1;
    let max = -1;
    for (const ch of channels) {
      for (let i = a; i < b; i++) {
        const v = ch[i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (min > max) continue;
    const y0 = mid - max * mid;
    const y1 = mid - min * mid;
    ctx.fillRect(x, y0, 1, Math.max(1, y1 - y0));
  }

  if (markers.loop) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    for (const f of [markers.loop.start, markers.loop.end]) {
      const x = Math.round((f / n) * w) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }
  if (markers.playhead !== undefined && markers.playhead !== null) {
    const x = Math.round((markers.playhead / n) * w) + 0.5;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

export function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}
