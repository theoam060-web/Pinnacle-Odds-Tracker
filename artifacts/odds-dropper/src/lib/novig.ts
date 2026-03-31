function imp(odd: number): number {
  return 1 / odd;
}

function binarySearch(
  fn: (x: number) => number,
  target: number,
  lo: number,
  hi: number,
  iterations = 80,
): number {
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function proportional(odds: number[]): number[] {
  const overround = odds.reduce((s, o) => s + imp(o), 0);
  return odds.map(o => o * overround);
}

export function additive(odds: number[]): number[] {
  const probs = odds.map(imp);
  const margin = (probs.reduce((s, p) => s + p, 0) - 1) / odds.length;
  return probs.map(p => {
    const fair = p - margin;
    return fair > 0 ? 1 / fair : Infinity;
  });
}

export function power(odds: number[]): number[] {
  const probs = odds.map(imp);
  const sum1 = probs.reduce((s, p) => s + p, 0);
  if (Math.abs(sum1 - 1) < 1e-9) return odds;

  // Find k such that sum(probs^k) = 1; k>1 removes margin since probs<1
  const k = binarySearch(
    (kk) => probs.reduce((s, p) => s + Math.pow(p, kk), 0),
    1,
    1,
    20,
  );
  return probs.map(p => 1 / Math.pow(p, k));
}

export function shin(odds: number[]): number[] {
  const probs = odds.map(imp);
  const S = probs.reduce((s, p) => s + p, 0);
  if (Math.abs(S - 1) < 1e-9) return odds;

  function shinProb(z: number, p: number): number {
    if (z >= 1) return p / S;
    return (Math.sqrt(z * z + 4 * (1 - z) * (p * p) / S) - z) / (2 * (1 - z));
  }

  const z = binarySearch(
    (zz) => probs.reduce((s, p) => s + shinProb(zz, p), 0),
    1,
    0,
    0.999,
  );
  return probs.map(p => {
    const fair = shinProb(z, p);
    return fair > 0 ? 1 / fair : Infinity;
  });
}

export function oddsRatio(odds: number[]): number[] {
  const probs = odds.map(imp);
  const S = probs.reduce((s, p) => s + p, 0);
  if (Math.abs(S - 1) < 1e-9) return odds;

  function fairProb(OR: number, p: number): number {
    return p / (p + OR * (1 - p));
  }

  const OR = binarySearch(
    (r) => probs.reduce((s, p) => s + fairProb(r, p), 0),
    1,
    1,
    1000,
  );
  return probs.map(p => {
    const fair = fairProb(OR, p);
    return fair > 0 ? 1 / fair : Infinity;
  });
}

export function wpo(odds: number[]): number[] {
  const probs = odds.map(imp);
  const S = probs.reduce((s, p) => s + p, 0);
  const margin = S - 1;
  if (Math.abs(margin) < 1e-9) return odds;

  return probs.map(p => {
    const fair = p - margin * (p / S);
    return fair > 0 ? 1 / fair : Infinity;
  });
}

export interface NovigResult {
  power: number;
  shin: number;
  oddsRatio: number;
  wpo: number;
  additive: number;
  proportional: number;
}

export function computeNovig(allOdds: number[], targetIndex: number): NovigResult {
  if (allOdds.length < 2) {
    const o = allOdds[targetIndex] ?? NaN;
    return { power: o, shin: o, oddsRatio: o, wpo: o, additive: o, proportional: o };
  }
  return {
    power: parseFloat((power(allOdds)[targetIndex] ?? NaN).toFixed(3)),
    shin: parseFloat((shin(allOdds)[targetIndex] ?? NaN).toFixed(3)),
    oddsRatio: parseFloat((oddsRatio(allOdds)[targetIndex] ?? NaN).toFixed(3)),
    wpo: parseFloat((wpo(allOdds)[targetIndex] ?? NaN).toFixed(3)),
    additive: parseFloat((additive(allOdds)[targetIndex] ?? NaN).toFixed(3)),
    proportional: parseFloat((proportional(allOdds)[targetIndex] ?? NaN).toFixed(3)),
  };
}
