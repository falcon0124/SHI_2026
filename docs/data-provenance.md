# Data provenance

What on screen is real and what is illustrative. Updated 2026-09-21.

## Real
**CPI Transport & Communication benchmark** — `src/lib/api/data/cpi-transport.json`
- Source: MoSPI eSankhyiki API, `GET https://api.mospi.gov.in/api/cpi/getCPIIndex`
- Query: `base_year=2012&series=Current&year=<Y>&month_code=<1..12>&sector_code=3` (3 = Combined), keeping rows where `state = "All India"` and `subgroup = "Transport and Communication"`.
- Range: Jan 2023 – Dec 2025 (36 monthly points, status F). The API returned no data for 2026 under base 2012 or base 2024 at pull time.
- Pulled once, 2026-09-21 (IST). The site shows it rebased to Jan 2024 = 100. Daily/weekly views hold the monthly value constant within each month, because CPI is only published monthly.
- Notes: the API needs `sector_code`, otherwise it returns only the rural December row. The server uses legacy TLS renegotiation, so use curl rather than Python's urllib.

## Illustrative (not real)
APIx index values, sub-indices, route fares and bands, price-by-source, booking curve, source uptime, anomaly log, intake counts, movers, "fares read", and all schedule times (sweeps, daily/weekly/monthly releases). Live fares could not be pulled: airline and OTA fares appear only after a JavaScript search behind bot protection, and the public route landing pages carry no fare data.

## Still to source
- DGCA domestic city-pair traffic (real basket weights and the seat-share figure) — DGCA's portal is dynamic and was not scraped.
- Real fares — needs an official API (e.g. Amadeus Self-Service) or a partner arrangement.
