import type { ApixSeries, Freq, Overview, SubIndices } from "../schemas";
import cpi from "../data/cpi-transport.json";

/**
 * PROVENANCE
 *  - CPI benchmark: REAL. MoSPI eSankhyiki API, pulled once (see ../data/cpi-transport.json).
 *  - APIx line, route/source/quality figures: ILLUSTRATIVE. No live fare data has been collected yet.
 */

/** Illustrative APIx monthly values, Jan 2024 = 100, Jan 2024 – Dec 2025. */
const MONTHLY = [100.0, 100.9, 102.3, 100.8, 101.9, 104.2, 107.6, 112.3, 115.1, 111.4, 108.9, 106.2, 110.7, 114.9, 119.8, 104.1, 105.6, 108.3, 111.9, 116.8, 120.4, 116.2, 116.0, 118.4];

const gen = <T>(n: number, f: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => f(i));
const r1 = (v: number) => Math.round(v * 10) / 10;

/** Timestamp the CPI data was pulled (IST). Drives every "as of" in the mocks. */
export const RETRIEVED_AT = cpi.retrieved_at;

/** Real CPI Transport & Communication, rebased to Jan 2024 = 100, keyed by "YYYY-MM". */
const cpiByMonth = new Map(cpi.points.map((p) => [p.period, p.index]));
const cpiBase = cpiByMonth.get("2024-01")!;
const cpiRebased = (period: string) => r1(((cpiByMonth.get(period) ?? NaN) / cpiBase) * 100);

const monthlyPeriods = (): string[] =>
  gen(MONTHLY.length, (i) => `${2024 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`);

// Last real observation is 2025-12; daily/weekly windows end at its month-end.
const TODAY = Date.UTC(2025, 11, 31);
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const DAY = 86_400_000;
const monthOf = (isoDate: string) => isoDate.slice(0, 7);

const benchmarkMeta = {
  name: "CPI Transport & Communication",
  detail: "MoSPI eSankhyiki API · All India, combined · base 2012=100, rebased to Jan 2024=100",
  retrieved_at: RETRIEVED_AT,
  real: true,
};

const std = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
};

export function mockApix(freq: Freq): ApixSeries {
  const base = "2024-01=100";
  const last12 = MONTHLY.slice(-12);
  const common = {
    series: "APIx" as const,
    base,
    freq,
    illustrative: true,
    benchmark_source: benchmarkMeta,
    mom: MONTHLY[MONTHLY.length - 1] / MONTHLY[MONTHLY.length - 2] - 1,
    yoy: MONTHLY[MONTHLY.length - 1] / MONTHLY[MONTHLY.length - 13] - 1,
  };
  const range = { range_12m_min: Math.min(...last12), range_12m_max: Math.max(...last12), volatility_12m: Math.round(std(last12) * 100) / 100 };

  if (freq === "daily" || freq === "weekly") {
    const daily = freq === "daily";
    const n = daily ? 90 : 52;
    const step = daily ? DAY : 7 * DAY;
    const v = daily
      ? gen(n, (i) => 112 + 6 * Math.sin(i / 7) + 2.4 * Math.sin(i / 2.3) + i * 0.055)
      : gen(n, (i) => 110 + 7 * Math.sin(i / 8.2) + 2 * Math.sin(i / 2.7) + i * 0.09);
    const dates = gen(n, (i) => isoDay(TODAY - (n - 1 - i) * step));
    return {
      ...common,
      title: daily ? "Daily index, last 90 days" : "Weekly index, rolling 52 weeks",
      points: dates.map((period, i) => ({ period, value: r1(v[i]) })),
      // Real monthly CPI, held constant within each month (CPI is only published monthly).
      benchmark: dates.map((period) => ({ period, value: cpiRebased(monthOf(period)) })),
      stats: { change: daily ? 0.0042 : 0.0118, ...range, observations: daily ? 4812 : 33684 },
    };
  }

  const periods = monthlyPeriods();
  return {
    ...common,
    title: "Monthly index, Jan 2024 – Dec 2025",
    points: periods.map((period, i) => ({ period, value: MONTHLY[i] })),
    benchmark: periods.map((period) => ({ period, value: cpiRebased(period) })),
    stats: { change: common.mom, ...range, observations: 144360 },
  };
}

export function mockOverview(): Overview {
  const mom = MONTHLY[MONTHLY.length - 1] / MONTHLY[MONTHLY.length - 2] - 1;
  const yoy = MONTHLY[MONTHLY.length - 1] / MONTHLY[MONTHLY.length - 13] - 1;
  return {
    as_of: RETRIEVED_AT,
    release_label: "Release 12/2025",
    headline: { level: MONTHLY[MONTHLY.length - 1], mom, yoy, base: "2024-01=100", period_label: "December 2025", prev_period_label: "November" },
    problem: { swing_min_pct: 200, swing_max_pct: 400, observations_per_month: 30 },
    today: { fares_read: 4812, scraper_uptime_30d: 0.992, outlier_rate: 0.0031 },
    chart_note: "CPI benchmark is real MoSPI data; the APIx series is illustrative until live fare collection is connected.",
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
    as_of: RETRIEVED_AT,
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
