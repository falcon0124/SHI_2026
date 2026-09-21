import type { Basket, RouteDetail, Routes } from "../schemas";

interface Seed { pair: string; cities: string; delta: number; index: number; mean: number; swing: number; note: string; base: number; amp: number }

const SEEDS: Seed[] = [
  { pair: "DEL–BOM", cities: "Delhi – Mumbai", delta: 0.048, index: 121.6, mean: 6480, swing: 312, note: "Highest-density trunk route; 11 sources, ~800 quotes a day.", base: 6480, amp: 1450 },
  { pair: "DEL–BLR", cities: "Delhi – Bengaluru", delta: 0.031, index: 119.2, mean: 7120, swing: 268, note: "Business-heavy weekday demand with sharp Monday peaks.", base: 7120, amp: 1600 },
  { pair: "BOM–BLR", cities: "Mumbai – Bengaluru", delta: 0.014, index: 114.8, mean: 5240, swing: 241, note: "Short-haul shuttle; narrowest fare band in the basket.", base: 5240, amp: 980 },
  { pair: "DEL–CCU", cities: "Delhi – Kolkata", delta: -0.007, index: 109.3, mean: 5860, swing: 204, note: "Festival-season sensitive; strong October–November spikes.", base: 5860, amp: 1180 },
  { pair: "BLR–HYD", cities: "Bengaluru – Hyderabad", delta: 0.022, index: 112.1, mean: 4310, swing: 188, note: "Thin route, three carriers; higher imputation risk.", base: 4310, amp: 820 },
  { pair: "DEL–GOI", cities: "Delhi – Goa", delta: 0.069, index: 126.4, mean: 8050, swing: 394, note: "Leisure route; most volatile pair in the basket.", base: 8050, amp: 2400 },
];

export function mockRoutes(): Routes {
  return {
    routes: SEEDS.map((s) => ({
      pair: s.pair, cities: s.cities, delta_30d: s.delta, index: s.index,
      mean_fare_inr: s.mean, max_swing_pct: s.swing, note: s.note,
    })),
  };
}

const SOURCES: [string, "Airline" | "OTA" | "Aggregator", number, boolean][] = [
  ["IndiGo", "Airline", 6214, false], ["Air India", "Airline", 6890, false],
  ["Akasa Air", "Airline", 6040, false], ["SpiceJet", "Airline", 5780, false],
  ["MakeMyTrip", "OTA", 6350, false], ["Cleartrip", "OTA", 6420, false], ["Ixigo", "OTA", 8410, true],
];

const DAY = 86_400_000;

export function mockRouteDetail(pair: string): RouteDetail | null {
  const r = SEEDS.find((s) => s.pair === pair.replace("-", "–"));
  if (!r) return null;
  const today = Date.UTC(2025, 11, 31);
  const scale = r.base / 6480; // other routes scale the DEL–BOM source table
  const mean = Array.from({ length: 30 }, (_, i) => r.base + r.amp * 0.45 * Math.sin(i / 4.1) + r.amp * 0.18 * Math.sin(i / 1.7) + i * (r.base * 0.004));
  const band = mean.map((m, i) => ({
    date: new Date(today - (29 - i) * DAY).toISOString().slice(0, 10),
    min: Math.round(m - r.amp * (0.42 + 0.2 * Math.cos(i / 2.9))),
    mean: Math.round(m),
    max: Math.round(m + r.amp * (0.7 + 0.3 * Math.sin(i / 3.3))),
  }));
  const curve = Array.from({ length: 25 }, (_, i) => {
    const d = 60 - i * 2.5;
    return { days_to_departure: d, mean_fare_inr: Math.round(r.base * (0.72 + 1.15 * Math.pow(Math.max(0, 60 - d) / 60, 3.1))) };
  });
  return {
    pair: r.pair, index: r.index, mean_fare_inr: r.mean,
    min_fare_inr: Math.min(...band.map((b) => b.min)),
    max_fare_inr: Math.max(...band.map((b) => b.max)),
    observations: 812,
    band,
    by_source: SOURCES.map(([source, kind, p, flagged]) => ({ source, kind, median_fare_inr: Math.round(p * scale), flagged })),
    booking_curve: curve,
  };
}

export function mockBasket(): Basket {
  return {
    base: "2024-01", weight_source: "DGCA 2025", seat_share: 0.31,
    methodology_version: "1.2", methodology_date: "September 2026",
    pairs: [
      { pair: "DEL–BOM", weight: 0.243 }, { pair: "DEL–BLR", weight: 0.198 }, { pair: "BOM–BLR", weight: 0.171 },
      { pair: "DEL–CCU", weight: 0.152 }, { pair: "BLR–HYD", weight: 0.121 }, { pair: "DEL–GOI", weight: 0.115 },
    ],
  };
}
