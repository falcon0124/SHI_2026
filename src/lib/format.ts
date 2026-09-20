import type { Freq } from "./api/schemas";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MINUS = "−";

/** 0.0207 → "+2.07%", −0.007 → "−0.7%". */
export function pct(fraction: number, digits = 1, signed = true): string {
  const v = fraction * 100;
  const s = Math.abs(v).toFixed(digits);
  if (!signed) return `${s}%`;
  return `${v < 0 ? MINUS : "+"}${s}%`;
}

export function pp(v: number): string {
  return `${v < 0 ? MINUS : "+"}${Math.abs(v).toFixed(2)} pp`;
}

export const num = (v: number, digits = 0) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;

/** Up = bad for consumers (red), down = good (green). */
export const deltaColor = (v: number) => (v < 0 ? "text-green" : "text-red");

/** "2026-09-19T18:00:00+05:30" → "19 Sep 2026 · 18:00 IST" (no tz conversion). */
export function releaseStamp(iso: string): string {
  const [d, t] = iso.split("T");
  const [y, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y} · ${t.slice(0, 5)} IST`;
}

export const hhmm = (iso: string) => iso.split("T")[1].slice(0, 5);

/** X-axis label for a series period. */
export function periodLabel(period: string, freq: Freq): string {
  const [y, m, d] = period.split("-");
  const mon = MONTHS[Number(m) - 1];
  if (freq === "daily") return `${String(Number(d)).padStart(2, "0")} ${mon}`;
  return `${mon} ${y.slice(2)}`;
}

export const dayLabel = (i: number, n: number) => (i === n - 1 ? "Today" : `D-${n - 1 - i}`);
