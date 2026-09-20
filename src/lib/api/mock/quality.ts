import type { Anomalies, QualitySummary, Sources } from "../schemas";

const S: [string, string, "Airline" | "OTA" | "Aggregator", number, number][] = [
  ["indigo", "IndiGo", "Airline", 0.998, 1.2], ["airindia", "Air India", "Airline", 0.994, 1.8],
  ["akasa", "Akasa Air", "Airline", 0.999, 0.9], ["spicejet", "SpiceJet", "Airline", 0.962, 3.4],
  ["allianceair", "Alliance Air", "Airline", 0.987, 2.1], ["makemytrip", "MakeMyTrip", "OTA", 0.981, 2.6],
  ["cleartrip", "Cleartrip", "OTA", 0.992, 1.5], ["ixigo", "Ixigo", "OTA", 0.948, 4.1],
  ["yatra", "Yatra", "OTA", 0.979, 2.9], ["easemytrip", "EaseMyTrip", "OTA", 0.99, 1.7],
  ["googleflights", "Google Flights", "Aggregator", 0.996, 1.1],
];

export function mockSources(): Sources {
  return {
    as_of: "2026-09-19T18:00:00+05:30",
    last_sweep: "2026-09-19T18:00:00+05:30",
    sources: S.map(([id, name, kind, uptime_30d, latency_s]) => ({ id, name, kind, up: true, uptime_30d, latency_s })),
  };
}

const T = (hm: string) => `2026-09-19T${hm}:00+05:30`;

export function mockAnomalies(): Anomalies {
  const items: Anomalies["items"] = [
    { ts: T("14:22"), pair: "DEL–GOI", rule: "cross_source_gap", rule_label: "Cross-source gap > 40%", action: "rejected" },
    { ts: T("13:07"), pair: "DEL–BOM", rule: "iqr_outlier", rule_label: "IQR outlier, upper fence", action: "rejected" },
    { ts: T("12:41"), pair: "BLR–HYD", rule: "tax_floor", rule_label: "Fare below tax floor", action: "rejected" },
    { ts: T("12:04"), pair: "DEL–CCU", rule: "layout_drift", rule_label: "Scraper layout drift", action: "auto_healed" },
    { ts: T("09:58"), pair: "BOM–BLR", rule: "duplicate_flight", rule_label: "Duplicate flight number", action: "deduplicated" },
    { ts: T("06:33"), pair: "DEL–BLR", rule: "promo_fare", rule_label: "Promo fare code detected", action: "flagged" },
  ];
  return { count: items.length, items };
}

export function mockQualitySummary(): QualitySummary {
  return {
    rules: [
      { id: "cross_source_gap", name: "Cross-source reconciliation", description: "Airline price compared with OTA price for the same flight number; gaps above 40% are rejected." },
      { id: "iqr_outlier", name: "Interquartile outlier fence", description: "Quotes outside 1.5×IQR of the route-day distribution are removed before aggregation." },
      { id: "tax_floor", name: "Tax floor check", description: "Any fare below statutory taxes and UDF for the sector is treated as an error fare." },
      { id: "coverage", name: "Coverage threshold", description: "A route-day needs at least six valid quotes per booking window or the cell is carried forward." },
    ],
    intake: { collected: 4812, passed: 4797, rejected: 15, imputed: 0 },
  };
}
