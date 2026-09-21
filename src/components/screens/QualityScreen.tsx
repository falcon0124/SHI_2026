"use client";
import { getQualityAnomalies, getQualitySummary, getQualitySources } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, SkeletonBlock } from "@/components/ui/Async";
import { Card, CardTitle, Container, DataTable, Dek, Eyebrow, RuleCell, RuleGrid, StatusDot, Tag } from "@/components/ui/primitives";
import { hhmm, num, pct } from "@/lib/format";
import type { AnomalyAction } from "@/lib/api/schemas";

const ACTIONS: Record<AnomalyAction, { label: string; tone: "red" | "warn" | "neutral" }> = {
  rejected: { label: "Rejected", tone: "red" },
  auto_healed: { label: "Auto-healed", tone: "warn" },
  flagged: { label: "Flagged", tone: "warn" },
  deduplicated: { label: "Deduplicated", tone: "neutral" },
};

export function QualityScreen() {
  const src = useApi(getQualitySources);
  const an = useApi(() => getQualityAnomalies());
  const sum = useApi(getQualitySummary);

  return (
    <Container className="pb-14 pt-9">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-[22px]">
        <div>
          <Eyebrow>Operations</Eyebrow>
          <h1 className="mt-2 font-display text-[30px] font-semibold tracking-[-0.015em]">Collection &amp; data quality</h1>
          <Dek>Every figure the index publishes is traceable to a source, a sweep and a validation rule. This page shows all three, live.</Dek>
        </div>
        {src.status === "ready" && (() => {
          const up = src.data.sources.filter((s) => s.up).length;
          const all = up === src.data.sources.length;
          return (
            <div className={`flex items-center gap-[10px] border px-4 py-[10px] ${all ? "border-green-border bg-green-wash2" : "border-[#F0CDB0] bg-accent-tag-bg"}`} role="status">
              <StatusDot color={all ? "bg-green" : "bg-accent"} />
              <span className="text-[13.5px]">
                {all ? `All ${up} sources reporting` : `${up} of ${src.data.sources.length} sources reporting`} · last sweep {hhmm(src.data.last_sweep)} IST
              </span>
            </div>
          );
        })()}
      </div>

      <h2 className="mb-4 mt-[30px] font-display text-[18px] font-semibold">Source health</h2>
      <Async state={src} skeleton={<SkeletonBlock height={160} label="Loading source health" />} isEmpty={(s) => s.sources.length === 0} empty={{ title: "No sources configured" }}>
        {(s) => (
          <RuleGrid min={250} fill>
            {s.sources.map((x) => {
              const ok = x.up && x.uptime_30d >= 0.97;
              return (
                <RuleCell key={x.id} interactive className="px-5 py-[18px]">
                  <div className="flex items-center justify-between gap-[10px]">
                    <span className="text-[14.5px] font-medium">{x.name}</span>
                    <StatusDot color={ok ? "bg-green" : "bg-accent"} label={ok ? "Healthy" : "Degraded"} />
                  </div>
                  <div className="mt-[3px] text-[11.5px] uppercase tracking-[0.07em] text-faint">{x.kind}</div>
                  <div className="relative mt-[14px] h-[6px] bg-wash-bar" aria-hidden>
                    <span className={`absolute inset-y-0 left-0 ${ok ? "bg-green" : "bg-accent"}`} style={{ width: `${x.uptime_30d * 100}%` }} />
                  </div>
                  <div className="mt-[9px] flex justify-between font-mono text-[12px] text-muted"><span>{pct(x.uptime_30d, 1, false)} uptime</span><span>{x.latency_s.toFixed(1)} s</span></div>
                </RuleCell>
              );
            })}
          </RuleGrid>
        )}
      </Async>

      <div className="mt-[34px] flex flex-wrap items-start gap-8">
        <Card className="min-w-0 flex-[3_1_420px] !px-[26px] !py-6">
          <CardTitle>Anomaly log</CardTitle>
          <Async state={an} skeleton={<SkeletonBlock height={200} label="Loading anomalies" />} isEmpty={(a) => a.items.length === 0} empty={{ title: "No anomalies today", hint: "Every observation passed validation." }}>
            {(a) => (
              <DataTable
                caption="Anomaly log" minWidth={520} rowKey={(r) => r.ts + r.pair + r.rule} rows={a.items}
                columns={[
                  { header: "Time", cell: (r) => hhmm(r.ts), className: "font-mono text-muted" },
                  { header: "Route", cell: (r) => r.pair, className: "font-mono" },
                  { header: "Rule triggered", cell: (r) => r.rule_label, className: "text-slate" },
                  { header: "Action", cell: (r) => <Tag tone={ACTIONS[r.action].tone}>{ACTIONS[r.action].label}</Tag> },
                ]}
              />
            )}
          </Async>
        </Card>

        <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-6">
          <Async state={sum} skeleton={<SkeletonBlock height={200} label="Loading rules" />}>
            {(s) => (
              <>
                <Card className="!px-[26px] !py-6">
                  <CardTitle>Validation rules</CardTitle>
                  <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
                    {s.rules.map((r) => (
                      <li key={r.id} className="flex gap-3">
                        <span className="mt-[7px] h-[7px] w-[7px] flex-none bg-green" aria-hidden />
                        <div>
                          <div className="text-[14px] font-medium">{r.name}</div>
                          <div className="mt-[2px] text-[13px] leading-[1.5] text-muted">{r.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="!px-[26px] !py-6">
                  <CardTitle>Today&apos;s intake</CardTitle>
                  <dl className="m-0 flex flex-col gap-[11px] text-[13.5px]">
                    {[
                      ["Quotes collected", s.intake.collected, ""],
                      ["Passed validation", s.intake.passed, ""],
                      ["Rejected as outliers", s.intake.rejected, "text-red"],
                      ["Imputed cells", s.intake.imputed, ""],
                    ].map(([l, v, c]) => (
                      <div key={l as string} className="flex justify-between">
                        <dt className="text-slate">{l}</dt>
                        <dd className={`m-0 font-mono text-[13.5px] font-medium ${c}`}>{num(v as number)}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </>
            )}
          </Async>
        </div>
      </div>
    </Container>
  );
}
