// Fallback pitch detection for imported samples with no note in the filename
// or metadata. Normalised autocorrelation on a window from the sustain.

export function detectPitch(channels, sampleRate, { fromFrac = 0.2, windowMs = 120 } = {}) {
  const mono = channels.length === 1 ? channels[0] : mix(channels);
  const win = Math.min(mono.length, Math.round((windowMs / 1000) * sampleRate));
  const from = Math.min(mono.length - win, Math.floor(mono.length * fromFrac));
  if (win < 1024) return null;
  const x = mono.subarray(from, from + win);

  const minLag = Math.floor(sampleRate / 2000);   // 2 kHz
  const maxLag = Math.min(Math.floor(sampleRate / 27), Math.floor(x.length / 2)); // ~A0
  const n = x.length;
  const span = n - maxLag;                        // compare the same number of samples at every lag
  let e0 = 0;
  for (let i = 0; i < span; i++) e0 += x[i] * x[i];
  if (e0 < 1e-6) return null;

  const nac = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let r = 0;
    let e1 = 0;
    for (let i = 0; i < span; i++) {
      r += x[i] * x[i + lag];
      e1 += x[i + lag] * x[i + lag];
    }
    nac[lag] = r / Math.sqrt(e0 * e1 + 1e-12);
  }

  // Best local peak of the normalised autocorrelation.
  let bestLag = -1;
  let bestVal = 0;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (nac[lag] > bestVal && nac[lag] >= nac[lag - 1] && nac[lag] >= nac[lag + 1]) {
      bestVal = nac[lag];
      bestLag = lag;
    }
  }
  if (bestLag < 0 || bestVal < 0.5) return null;

  // Guard against locking an octave (or more) low: if a sub-multiple of the
  // best lag is also a strong peak, take that instead.
  for (let k = 4; k >= 2; k--) {
    const l = Math.round(bestLag / k);
    if (l < minLag + 1) continue;
    let localBest = l;
    for (let j = l - 2; j <= l + 2; j++) if (j > minLag && j < maxLag && nac[j] > nac[localBest]) localBest = j;
    if (nac[localBest] >= bestVal * 0.9 && nac[localBest] >= nac[localBest - 1] && nac[localBest] >= nac[localBest + 1]) {
      bestLag = localBest;
      break;
    }
  }

  // Parabolic interpolation around the peak for sub-sample accuracy.
  const a = nac[bestLag - 1], b = nac[bestLag], c = nac[bestLag + 1];
  const denom = a - 2 * b + c;
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  const lag = bestLag + Math.max(-1, Math.min(1, shift));

  const hz = sampleRate / lag;
  const midi = 69 + 12 * Math.log2(hz / 440);
  return { hz, midi: Math.round(midi), cents: Math.round((midi - Math.round(midi)) * 100), confidence: bestVal };
}

function mix(channels) {
  const n = channels[0].length;
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const ch of channels) s += ch[i];
    m[i] = s / channels.length;
  }
  return m;
}
