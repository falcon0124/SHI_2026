/** Reference content for the API docs page: the five published endpoints. */
export interface EndpointDoc {
  path: string;
  desc: string;
  params: { n: string; t: string; d: string }[];
  req: string;
  res: string;
}

export const ENDPOINTS: EndpointDoc[] = [
  {
    path: "/series/apix",
    desc: "Returns the headline all-India index at the requested frequency, with period-on-period and year-on-year change.",
    params: [
      { n: "freq", t: "string", d: "daily | weekly | monthly. Defaults to monthly." },
      { n: "from", t: "date", d: "ISO start date, inclusive." },
      { n: "to", t: "date", d: "ISO end date, inclusive." },
      { n: "format", t: "string", d: "json | csv. Defaults to json." },
    ],
    req: 'curl -H "Authorization: Bearer $KEY" \\\n  "https://apix.mospi.gov.in/v1/series/apix\\\n   ?freq=monthly&from=2026-01-01"',
    res: '{\n  "series": "APIx",\n  "base": "2024-01=100",\n  "freq": "monthly",\n  "points": [\n    { "period": "2026-08", "value": 116.0 },\n    { "period": "2026-09", "value": 118.4 }\n  ],\n  "mom": 0.0207,\n  "yoy": 0.1149\n}',
  },
  {
    path: "/series/routes/{pair}",
    desc: "Route-level sub-index and fare statistics for one basket city-pair.",
    params: [
      { n: "pair", t: "path", d: "IATA pair, e.g. DEL-BOM." },
      { n: "freq", t: "string", d: "daily | weekly | monthly." },
      { n: "window", t: "int", d: "Booking window in days: 7, 15 or 30." },
    ],
    req: 'curl -H "Authorization: Bearer $KEY" \\\n  "https://apix.mospi.gov.in/v1/series/routes/DEL-BOM\\\n   ?freq=daily&window=15"',
    res: '{\n  "pair": "DEL-BOM",\n  "index": 121.6,\n  "mean_fare_inr": 6480,\n  "min_fare_inr": 3940,\n  "max_fare_inr": 16280,\n  "observations": 812\n}',
  },
  {
    path: "/basket",
    desc: "The current basket definition, weights and reference base period.",
    params: [{ n: "year", t: "int", d: "Weight reference year. Defaults to current." }],
    req: 'curl -H "Authorization: Bearer $KEY" \\\n  "https://apix.mospi.gov.in/v1/basket"',
    res: '{\n  "base": "2024-01",\n  "weight_source": "DGCA 2025",\n  "pairs": [\n    { "pair": "DEL-BOM", "weight": 0.243 },\n    { "pair": "DEL-BLR", "weight": 0.198 }\n  ]\n}',
  },
  {
    path: "/quality/sources",
    desc: "Live collection health for each scraped source: uptime, latency and last successful sweep.",
    params: [{ n: "date", t: "date", d: "Snapshot date. Defaults to today." }],
    req: 'curl -H "Authorization: Bearer $KEY" \\\n  "https://apix.mospi.gov.in/v1/quality/sources"',
    res: '{\n  "as_of": "2026-09-19T18:00:00+05:30",\n  "sources": [\n    { "id": "indigo", "up": true, "uptime_30d": 0.998 },\n    { "id": "makemytrip", "up": true, "uptime_30d": 0.981 }\n  ]\n}',
  },
  {
    path: "/quality/anomalies",
    desc: "Observations rejected or flagged by the validation rules, with the rule that fired.",
    params: [
      { n: "from", t: "date", d: "ISO start date." },
      { n: "rule", t: "string", d: "Filter by rule id, e.g. iqr_outlier." },
      { n: "limit", t: "int", d: "Max rows, up to 1000." },
    ],
    req: 'curl -H "Authorization: Bearer $KEY" \\\n  "https://apix.mospi.gov.in/v1/quality/anomalies?limit=50"',
    res: '{\n  "count": 15,\n  "items": [\n    {\n      "ts": "2026-09-19T14:22:00+05:30",\n      "pair": "DEL-GOI",\n      "rule": "cross_source_gap",\n      "action": "rejected"\n    }\n  ]\n}',
  },
];
