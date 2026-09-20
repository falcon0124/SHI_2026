# Backend contract (Phase 2 target)

The frontend validates every response with the Zod schemas in
[`src/lib/api/schemas.ts`](../src/lib/api/schemas.ts). **That file is the source of truth**; this
document summarises it. A response that fails validation renders the error state.

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (default `https://apix.mospi.gov.in/v1`).
- Auth: `Authorization: Bearer <key>`. JSON responses, `GET` only.
- Fractions, not percents: `0.0207` means +2.07%. `uptime_30d`, `outlier_rate`, `seat_share` likewise.
- Timestamps: ISO 8601 with `+05:30`. The UI displays the wall-clock time as given (no tz conversion).
- Route pairs in paths use a hyphen (`DEL-BOM`); the UI displays an en dash. Pair strings in bodies may use either, but the frontend matches on the **en dash** form (`DEL–BOM`) in `movers`, `routes`, `anomalies` and `basket`.
- Switch from mocks: `NEXT_PUBLIC_USE_MOCKS=false`.

**EXT** = added by the frontend beyond the five endpoints in the spec README. Fields marked EXT inside a documented endpoint are additive; the documented fields are unchanged.

## Documented endpoints

### `GET /series/apix?freq=daily|weekly|monthly`
Required: `series:"APIx"`, `base` ("2024-01=100"), `freq`, `points[{period,value}]`, `mom`, `yoy`.
EXT: `title`, `benchmark[{period,value}]` (CPI Transport, same periods as `points`),
`stats{change, range_12m_min, range_12m_max, volatility_12m, observations}`.
Period formats: monthly `YYYY-MM`; daily and weekly `YYYY-MM-DD` (weekly = week start).
Sizes: daily 90 points, weekly 52, monthly 21 (Jan 2025 → latest).
`stats.change` is the period-on-period change for the requested `freq`. Current level = last point.

### `GET /series/routes/{pair}`
Required: `pair`, `index`, `mean_fare_inr`, `min_fare_inr`, `max_fare_inr`, `observations`.
EXT: `band[{date,min,mean,max}]` (last 30 days, ascending), `by_source[{source,kind,median_fare_inr,flagged}]`
(`kind`: Airline | OTA | Aggregator; `flagged` marks an outlier quote), `booking_curve[{days_to_departure,mean_fare_inr}]` (60 → 0, descending).

### `GET /basket`
Required: `base`, `weight_source`, `pairs[{pair,weight}]`.
EXT: `seat_share`, `methodology_version`, `methodology_date` (e.g. "September 2026").

### `GET /quality/sources`
Required: `as_of`, `sources[{id,up,uptime_30d}]`.
EXT: `last_sweep`; per source `name`, `kind`, `latency_s`.

### `GET /quality/anomalies?limit=`
Required: `count`, `items[{ts,pair,rule,action}]`. `action`: `rejected | auto_healed | flagged | deduplicated`.
EXT: `rule_label` (human-readable rule text shown in the log).

## Extension endpoints

### `GET /overview`
`as_of`, `release_label`, `headline{level,mom,yoy,base,period_label,prev_period_label}` (`period_label` e.g. "September 2026"; `prev_period_label` e.g. "August"), `problem{swing_min_pct,swing_max_pct,observations_per_month}` (single-day fare swing range shown on the homepage, and reads per route per booking window), `today{fares_read,scraper_uptime_30d,outlier_rate}`,
`chart_note`, `movers[{pair,delta_30d}]` (top 5 by size), `collection{sources_online,sources_total,basket_pairs,readings_per_route_day,next_daily_run}`,
`calendar{daily,weekly,monthly,revisions}`.
The homepage uses this endpoint only (headline, problem, snapshot). The movers, collection and calendar blocks are shown on the dashboard rail. `as_of` also drives the masthead timestamp.

### `GET /series/subindices`
`as_of`, `mom_total`, `weight_source`, `items[{code,name,weight,level,mom,history[14]}]`,
`contributions[{code,name,pp}]` (percentage points; should sum to `mom_total × 100`).

### `GET /series/routes`
`routes[{pair,cities,delta_30d,index,mean_fare_inr,max_swing_pct,note}]`. `max_swing_pct` is a percent number (312 = 312%). Order is display order; the first is selected by default.

### `GET /quality/summary`
`rules[{id,name,description}]`, `intake{collected,passed,rejected,imputed}`.

## Derived in the UI (not returned by the API)
Bar widths, chart scales and ticks, delta colours (up = red/accent, down = green), source-health dot colour (green at `uptime_30d ≥ 0.97`), sparkline scaling, x-axis labels.

## Not yet implemented in the client
Query params other than `freq`, `limit` and `pair` (`from`, `to`, `window`, `year`, `date`, `rule`, `format`) are documented on the API docs page but not sent by any screen yet.
