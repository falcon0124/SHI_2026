import type { ApixSeries, Freq, Overview, SubIndices } from "../schemas";

const MONTHLY = [100.8, 101.9, 104.2, 107.6, 112.3, 115.1, 111.4, 108.9, 106.2, 110.7, 114.9, 119.8, 104.1, 105.6, 108.3, 111.9, 116.8, 120.4, 116.2, 116.0, 118.4];
const CPI = [100.4, 100.9, 101.3, 101.8, 102.4, 102.9, 103.1, 103.2, 103.0, 103.6, 104.1, 104.7, 105.0, 105.4, 105.9, 106.3, 106.9, 107.4, 107.6, 107.8, 108.2];

const gen = <T>(n: number, f: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => f(i));
const r1 = (v: number) => Math.round(v * 10) / 10;

const TODAY = Date.UTC(2026, 8, 19);
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const DAY = 86_400_000;

function monthlyPeriods(): string[] {
  return gen(MONTHLY.length, (i) => {
    const m = i; // Jan 2025 + i
    return `${2025 + Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}`;
  });
}

export function mockApix(freq: Freq): ApixSeries {
  const base = "2024-01=100";
  if (freq === "daily") {
    const v = gen(90, (i) => 112 + 6 * Math.sin(i / 7) + 2.4 * Math.sin(i / 2.3) + i * 0.055);
    const b = gen(90, (i) => 106.6 + i * 0.018);
    const dates = gen(90, (i) => isoDay(TODAY - (89 - i) * DAY));
    return {
      series: "APIx", base, freq, title: "Daily index, last 90 days",
      points: dates.map((period, i) => ({ period, value: r1(v[i]) })),
      benchmark: dates.map((period, i) => ({ period, value: r1(b[i]) })),
      mom: 0.0207, yoy: 0.1149,
      stats: { change: 0.0042, range_12m_min: 104.1, range_12m_max: 120.4, volatility_12m: 5.84, observations: 4812 },
    };
  }
  if (freq === "weekly") {
    const v = gen(52, (i) => 110 + 7 * Math.sin(i / 8.2) + 2 * Math.sin(i / 2.7) + i * 0.09);
    const b = gen(52, (i) => 104.4 + i * 0.073);
    const dates = gen(52, (i) => isoDay(TODAY - (51 - i) * 7 * DAY));
    return {
      series: "APIx", base, freq, title: "Weekly index, rolling 52 weeks",
      points: dates.map((period, i) => ({ period, value: r1(v[i]) })),
      benchmark: dates.map((period, i) => ({ period, value: r1(b[i]) })),
      mom: 0.0207, yoy: 0.1149,
      stats: { change: 0.0118, range_12m_min: 104.1, range_12m_max: 120.4, volatility_12m: 5.84, observations: 33684 },
    };
  }
  const periods = monthlyPeriods();
  return {
    series: "APIx", base, freq, title: "Monthly index, Jan 2025 – Sep 2026",
    points: periods.map((period, i) => ({ period, value: MONTHLY[i] })),
    benchmark: periods.map((period, i) => ({ period, value: CPI[i] })),
    mom: 0.0207, yoy: 0.1149,
    stats: { change: 0.0207, range_12m_min: 104.1, range_12m_max: 120.4, volatility_12m: 5.84, observations: 144360 },
  };
}

export function mockOverview(): Overview {
  return {
    as_of: "2026-09-19T18:00:00+05:30",
    release_label: "Release 09/2026",
    headline: { level: 118.4, mom: 0.0207, yoy: 0.1149, base: "2024-01=100" },
    today: { fares_read: 4812, scraper_uptime_30d: 0.992, outlier_rate: 0.0031 },
    chart_note:
      "APIx captures the May–June and December peaks that a monthly survey averages away. Divergence from the official series widens to 10.2 points in June 2026.",
    movers: [
      { pair: "DEL–GOI", delta_30d: 0.069 },
      { pair: "DEL–BOM", delta_30d: 0.048 },
      { pair: "DEL–BLR", delta_30d: 0.031 },
      { pair: "BLR–HYD", delta_30d: 0.022 },
      { pair: "DEL–CCU", delta_30d: -0.007 },
    ],
    collection: { sources_online: 11, sources_total: 11, basket_pairs: 6, readings_per_route_day: 800, next_daily_run: "21:00 IST" },
    calendar: { daily: "Daily 21:00 IST", weekly: "Weekly Monday 08:00", monthly: "Monthly 12th, 11:00 IST", revisions: "Revisions published with each monthly release." },
  };
}

export function mockSubIndices(): SubIndices {
  const h = (n: number, f: (i: number) => number) => gen(n, (i) => r1(f(i)));
  return {
    as_of: "2026-09-19T18:00:00+05:30",
    mom_total: 0.0207,
    weight_source: "DGCA 2025 schedule",
    items: [
      { code: "APIx.MT", name: "Metro trunk routes", weight: 0.441, level: 120.4, mom: 0.029, history: h(14, (i) => 108 + 9 * Math.sin(i / 3) + i * 0.7) },
      { code: "APIx.T2", name: "Metro – Tier II", weight: 0.212, level: 113.8, mom: 0.014, history: h(14, (i) => 106 + 5 * Math.sin(i / 2.4) + i * 0.5) },
      { code: "APIx.LC", name: "Leisure corridors", weight: 0.183, level: 126.4, mom: 0.069, history: h(14, (i) => 104 + 12 * Math.sin(i / 4.2) + i * 1.1) },
      { code: "APIx.SH", name: "Short-haul shuttle", weight: 0.104, level: 112.1, mom: 0.006, history: h(14, (i) => 108 + 3 * Math.sin(i / 2) + i * 0.3) },
      { code: "APIx.RG", name: "Regional (UDAN)", weight: 0.06, level: 104.7, mom: -0.004, history: h(14, (i) => 104 + 2.5 * Math.sin(i / 3.6)) },
    ],
    contributions: [
      { code: "APIx.LC", name: "Leisure corridors", pp: 0.82 },
      { code: "APIx.MT", name: "Metro trunk routes", pp: 0.71 },
      { code: "APIx.T2", name: "Metro – Tier II", pp: 0.38 },
      { code: "APIx.SH", name: "Short-haul shuttle", pp: 0.19 },
      { code: "APIx.RG", name: "Regional (UDAN)", pp: -0.03 },
    ],
  };
}
