/**
 * The API contract. Every response type in the app is derived from these
 * schemas; the Phase-2 backend must satisfy them (see docs/backend-contract.md).
 *
 * Fields marked EXT are extensions beyond the five endpoints in the spec README.
 */
import { z } from "zod";

export const FreqSchema = z.enum(["daily", "weekly", "monthly"]);
export type Freq = z.infer<typeof FreqSchema>;

export const PointSchema = z.object({ period: z.string(), value: z.number() });
export type Point = z.infer<typeof PointSchema>;

/* GET /series/apix */
export const ApixSeriesSchema = z.object({
  series: z.literal("APIx"),
  base: z.string(), // "2024-01=100"
  freq: FreqSchema,
  title: z.string(), // EXT
  points: z.array(PointSchema),
  benchmark: z.array(PointSchema), // EXT: CPI Transport, same periods
  mom: z.number(), // fraction, 0.0207 = +2.07% (period-on-period for the freq)
  yoy: z.number(),
  stats: z.object({
    // EXT
    change: z.number(), // period change, fraction
    range_12m_min: z.number(),
    range_12m_max: z.number(),
    volatility_12m: z.number(),
    observations: z.number().int(),
  }),
});
export type ApixSeries = z.infer<typeof ApixSeriesSchema>;

/* GET /overview (EXT) */
export const OverviewSchema = z.object({
  as_of: z.string(), // ISO 8601 with +05:30
  release_label: z.string(), // "Release 09/2026"
  headline: z.object({ level: z.number(), mom: z.number(), yoy: z.number(), base: z.string() }),
  today: z.object({
    fares_read: z.number().int(),
    scraper_uptime_30d: z.number(),
    outlier_rate: z.number(),
  }),
  chart_note: z.string(),
  movers: z.array(z.object({ pair: z.string(), delta_30d: z.number() })),
  collection: z.object({
    sources_online: z.number().int(),
    sources_total: z.number().int(),
    basket_pairs: z.number().int(),
    readings_per_route_day: z.number().int(),
    next_daily_run: z.string(),
  }),
  calendar: z.object({ daily: z.string(), weekly: z.string(), monthly: z.string(), revisions: z.string() }),
});
export type Overview = z.infer<typeof OverviewSchema>;

/* GET /series/subindices (EXT) */
export const SubIndicesSchema = z.object({
  as_of: z.string(),
  mom_total: z.number(),
  weight_source: z.string(),
  items: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      weight: z.number(),
      level: z.number(),
      mom: z.number(),
      history: z.array(z.number()),
    }),
  ),
  contributions: z.array(z.object({ code: z.string(), name: z.string(), pp: z.number() })),
});
export type SubIndices = z.infer<typeof SubIndicesSchema>;

/* GET /series/routes (EXT) */
export const RouteSummarySchema = z.object({
  pair: z.string(),
  cities: z.string(),
  delta_30d: z.number(),
  index: z.number(),
  mean_fare_inr: z.number(),
  max_swing_pct: z.number(),
  note: z.string(),
});
export type RouteSummary = z.infer<typeof RouteSummarySchema>;
export const RoutesSchema = z.object({ routes: z.array(RouteSummarySchema) });
export type Routes = z.infer<typeof RoutesSchema>;

/* GET /series/routes/{pair} */
export const RouteDetailSchema = z.object({
  pair: z.string(),
  index: z.number(),
  mean_fare_inr: z.number(),
  min_fare_inr: z.number(),
  max_fare_inr: z.number(),
  observations: z.number().int(),
  band: z.array(z.object({ date: z.string(), min: z.number(), mean: z.number(), max: z.number() })), // EXT, 30 days
  by_source: z.array(
    z.object({
      source: z.string(),
      kind: z.enum(["Airline", "OTA", "Aggregator"]),
      median_fare_inr: z.number(),
      flagged: z.boolean(),
    }),
  ), // EXT
  booking_curve: z.array(z.object({ days_to_departure: z.number(), mean_fare_inr: z.number() })), // EXT
});
export type RouteDetail = z.infer<typeof RouteDetailSchema>;

/* GET /basket */
export const BasketSchema = z.object({
  base: z.string(),
  weight_source: z.string(),
  seat_share: z.number(), // EXT: share of scheduled domestic seats covered
  methodology_version: z.string(), // EXT
  methodology_date: z.string(), // EXT: "September 2026"
  pairs: z.array(z.object({ pair: z.string(), weight: z.number() })),
});
export type Basket = z.infer<typeof BasketSchema>;

/* GET /quality/sources */
export const SourcesSchema = z.object({
  as_of: z.string(),
  last_sweep: z.string(), // EXT: ISO
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(), // EXT
      kind: z.enum(["Airline", "OTA", "Aggregator"]), // EXT
      up: z.boolean(),
      uptime_30d: z.number(),
      latency_s: z.number(), // EXT
    }),
  ),
});
export type Sources = z.infer<typeof SourcesSchema>;

/* GET /quality/anomalies */
export const AnomalyActionSchema = z.enum(["rejected", "auto_healed", "flagged", "deduplicated"]);
export type AnomalyAction = z.infer<typeof AnomalyActionSchema>;
export const AnomaliesSchema = z.object({
  count: z.number().int(),
  items: z.array(
    z.object({
      ts: z.string(),
      pair: z.string(),
      rule: z.string(),
      rule_label: z.string(), // EXT
      action: AnomalyActionSchema,
    }),
  ),
});
export type Anomalies = z.infer<typeof AnomaliesSchema>;

/* GET /quality/summary (EXT) */
export const QualitySummarySchema = z.object({
  rules: z.array(z.object({ id: z.string(), name: z.string(), description: z.string() })),
  intake: z.object({
    collected: z.number().int(),
    passed: z.number().int(),
    rejected: z.number().int(),
    imputed: z.number().int(),
  }),
});
export type QualitySummary = z.infer<typeof QualitySummarySchema>;
