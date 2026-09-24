# FareSankhya (APIx)

An experimental **Airfare Price Index** frontend built for MoSPI's (Ministry of Statistics & Programme Implementation) CPI Transport & Communication group. It turns high-frequency airfare quotes into an index — analogous to a stock index, but for the price of flying — to give a faster, more granular read on transport inflation than the standard monthly CPI survey.

This repo is the **frontend only**: a Next.js app with a typed API client, Zod-validated schemas, and realistic mock data standing in for a backend that doesn't exist yet (see [Project status](#project-status)).

## Why this exists

CPI collects the price of an airfare the same way it collects the price of rice — once, on a fixed day a month. But fares move hourly. FareSankhya's premise: read each route many times a day across airlines and travel agents, and compute a proper price index (a Jevons index per route, aggregated by a Modified Laspeyres weighted on passenger traffic) instead of relying on one surveyor's snapshot.

## Pages

| Route | Purpose |
|---|---|
| `/` | Marketing/explainer homepage — headline index level, the problem statement, methodology summary, live snapshot, audiences. |
| `/dashboard` | The index itself: APIx series (daily/weekly/monthly), sub-indices, contributions to monthly change, movers, collection stats, release calendar, CSV export. |
| `/routes` | Per-route detail: fare bands, price by source (airline/OTA/aggregator), booking curve by days-to-departure. |
| `/quality` | Data quality: source uptime, anomaly log (rejected/auto-healed/flagged/deduplicated quotes), intake summary. |
| `/methodology` | How the index is built — collection, cleaning, computation, delivery. |
| `/api-docs` | Public API reference for the endpoints below. |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- **Zod** for runtime response validation — `src/lib/api/schemas.ts` is the source of truth for the API contract
- No backend, no database, no auth in this repo — see [Backend contract](docs/backend-contract.md)

## Project structure

```
src/
  app/                  Route segments (App Router): dashboard, routes, quality, methodology, api-docs
  components/
    screens/            One "screen" component per route (the actual page content)
    charts/             Chart primitives
    chrome/             Header, footer, gov banner
    ui/                 Shared primitives (Async wrapper, buttons, grids, etc.)
  hooks/useApi.ts        Small hook wrapping async data-fetch + loading/error state
  lib/
    api/
      client.ts          One function per endpoint — the only module components use for data
      schemas.ts         Zod schemas = the API contract
      http.ts            Fetch wrapper, error handling
      mock/               Mock data generators (used when NEXT_PUBLIC_USE_MOCKS=true)
      data/cpi-transport.json  Real MoSPI CPI benchmark data (see Data provenance)
    format.ts             Number/date/percent formatting helpers
    chart.ts              Chart scaling helpers
docs/
  backend-contract.md     Full API contract (endpoints, fields, required vs. EXT)
  data-provenance.md      What's real data vs. illustrative/mocked
```

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | `true` | When `true`, all data comes from `src/lib/api/mock/*`. Set to `false` to hit a real backend. |
| `NEXT_PUBLIC_API_BASE_URL` | `https://apix.mospi.gov.in/v1` | Base URL used when mocks are off. |

### Other scripts

```bash
npm run build       # production build
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
```

## API contract

The frontend is built against a documented but **not-yet-implemented** backend. Full details in [docs/backend-contract.md](docs/backend-contract.md); summary:

- Base URL: `NEXT_PUBLIC_API_BASE_URL`, `Authorization: Bearer <key>`, JSON, `GET` only.
- Values are fractions, not percents (`0.0207` = +2.07%).
- Timestamps are ISO 8601 with `+05:30`, displayed as given (no timezone conversion).
- Route pairs use an en dash in bodies (`DEL–BOM`), a hyphen in URL paths (`DEL-BOM`).

**Documented endpoints:** `GET /series/apix`, `GET /series/routes/{pair}`, `GET /basket`, `GET /quality/sources`, `GET /quality/anomalies`.
**Extension endpoints** (added by this frontend beyond the original spec): `GET /overview`, `GET /series/subindices`, `GET /series/routes`, `GET /quality/summary`.

Switching from mocks to a live backend is one env var: `NEXT_PUBLIC_USE_MOCKS=false`.

## Data provenance

Most numbers on screen today are **illustrative**, not real — this is a frontend/UX build-out ahead of the data pipeline. See [docs/data-provenance.md](docs/data-provenance.md) for the exact breakdown. In short:

- **Real:** the CPI Transport & Communication benchmark line (`src/lib/api/data/cpi-transport.json`), pulled once from the MoSPI eSankhyiki API and shown for comparison against the illustrative APIx index.
- **Illustrative:** APIx index values, sub-indices, route fares, price-by-source, booking curves, source uptime, anomaly log, "fares read" counters, and all schedule times. Live fares aren't scraped yet — airline/OTA fares sit behind JS-rendered search and bot protection.
- **Still to source:** real DGCA route traffic (for basket weights) and a real fare feed (e.g. an Amadeus Self-Service-style API or partner data).

## Project status

This is a **Smart India Hackathon (SIH)** submission in active development. Current state:

- ✅ Full frontend UI across six pages, typed API client, Zod schemas, mock data layer
- ✅ Real CPI Transport benchmark integrated for comparison
- ⬜ Live fare scraping pipeline (airlines + OTAs)
- ⬜ Backend implementing the documented API contract
- ⬜ Real basket weights from DGCA traffic data

## License

No license file is currently included; treat this repository as all-rights-reserved unless the maintainers add one.
