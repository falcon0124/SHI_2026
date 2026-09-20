/** SVG geometry helpers. Ported from the prototype's poly/area/bandPath/ticks. */

export function pointsFromSeries(vals: number[], w: number, h: number, min: number, max: number): string {
  const n = vals.length;
  return vals
    .map((v, i) => {
      const x = n === 1 ? 0 : (i / (n - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function areaPath(vals: number[], w: number, h: number, min: number, max: number): string {
  return `M0,${h} L${pointsFromSeries(vals, w, h, min, max).split(" ").join(" L")} L${w},${h} Z`;
}

export function bandPath(lo: number[], hi: number[], w: number, h: number, min: number, max: number): string {
  const up = pointsFromSeries(hi, w, h, min, max).split(" ");
  const dn = pointsFromSeries(lo, w, h, min, max).split(" ").reverse();
  return `M${up.join(" L")} L${dn.join(" L")} Z`;
}

/** Integer-stepped scale covering all values, split into 4 equal intervals. */
export function niceScale(values: number[]): { min: number; max: number } {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const min = Math.floor(lo - 0.02 * (hi - lo));
  const step = Math.max(1, Math.ceil((hi - min) / 4));
  return { min, max: min + step * 4 };
}

/** Round-number scale for larger magnitudes (fares). */
export function niceScaleStep(values: number[], step: number): { min: number; max: number } {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const min = Math.floor(lo / step) * step;
  const s = Math.ceil((hi - min) / 4 / step) * step;
  return { min, max: min + s * 4 };
}

/** label_i = max − i·(max−min)/4, i = 0..4 (top to bottom). */
export function yTicks(min: number, max: number, fmt: (v: number) => string = (v) => v.toFixed(0)) {
  return Array.from({ length: 5 }, (_, i) => ({ label: fmt(max - (i * (max - min)) / 4), top: `${i * 25}%` }));
}

/** Pick n evenly spaced entries (always including first and last). */
export function pickEvenly<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  return Array.from({ length: n }, (_, i) => items[Math.round((i * (items.length - 1)) / (n - 1))]);
}
