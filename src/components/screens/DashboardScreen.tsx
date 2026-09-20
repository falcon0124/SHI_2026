"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getApixSeries, getSubIndices } from "@/lib/api/client";
import { FreqSchema, type Freq } from "@/lib/api/schemas";
import { useApi } from "@/hooks/useApi";
import { Async, SkeletonBlock } from "@/components/ui/Async";
import { Button, Card, CardTitle, Container, DataTable, PageHeader, RuleGrid, Segmented, StatTile, cx } from "@/components/ui/primitives";
import { ChartTable, LineChart, Sparkline } from "@/components/charts/charts";
import { DashboardRail } from "./DashboardRail";
import { niceScale, pickEvenly } from "@/lib/chart";
import { deltaColor, num, pct, periodLabel, pp } from "@/lib/format";

const FREQS: { id: Freq; label: string }[] = [
  { id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" },
];
const X_TICKS: Record<Freq, number> = { daily: 10, weekly: 9, monthly: 8 };

function csv(rows: string[][], name: string) {
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DashboardScreen() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const parsed = FreqSchema.safeParse(sp.get("freq"));
  const freq: Freq = parsed.success ? parsed.data : "monthly";
  const [bench, setBench] = useState(true);

  const series = useApi(() => getApixSeries(freq), [freq]);
  const subs = useApi(getSubIndices);
  const setFreq = (f: Freq) => router.replace(`${path}?freq=${f}`, { scroll: false });

  return (
    <Container className="pb-14 pt-9">
      <PageHeader eyebrow="Index dashboard" title="Airfare Price Index — All India" dek="The published series at every frequency, with the route groups and movements behind the headline number.">
        <div className="flex items-center gap-[10px]">
          <Segmented label="Frequency" options={FREQS} value={freq} onChange={setFreq} />
          <Button
            className="!px-4 !py-[9px] !text-[13.5px]"
            disabled={series.status !== "ready"}
            onClick={() => series.status === "ready" && csv([["period", "apix", "cpi_transport"], ...series.data.points.map((p, i) => [p.period, String(p.value), String(series.data.benchmark[i]?.value ?? "")])], `apix-${freq}.csv`)}
          >
            Download CSV
          </Button>
        </div>
      </PageHeader>

      <Async state={series} skeleton={<div className="mt-7 h-[90px] animate-pulse bg-wash-bar" role="status"><span className="sr-only">Loading statistics</span></div>} isEmpty={(a) => a.points.length === 0} empty={{ title: "No observations for this frequency", hint: "Try another frequency." }}>
        {(a) => (
          <RuleGrid className="mt-7">
            <StatTile label="Current level" value={a.points[a.points.length - 1].value.toFixed(1)} />
            <StatTile label="Period change" value={pct(a.stats.change, 2)} tone={deltaColor(a.stats.change)} />
            <StatTile label="12-month range" small value={`${a.stats.range_12m_min.toFixed(1)} – ${a.stats.range_12m_max.toFixed(1)}`} />
            <StatTile label="Volatility (σ, 12m)" value={a.stats.volatility_12m.toFixed(2)} />
            <StatTile label="Observations" value={num(a.stats.observations)} />
          </RuleGrid>
        )}
      </Async>

      <div className="mt-8 flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
          <Async state={series} skeleton={<SkeletonBlock height={340} label="Loading index series" />} isEmpty={(a) => a.points.length === 0} empty={{ title: "No observations for this frequency", hint: "Try another frequency." }}>
            {(a) => {
              const v = a.points.map((p) => p.value);
              const b = a.benchmark.map((p) => p.value);
              const { min, max } = niceScale(bench ? [...v, ...b] : v);
              return (
                <div className="border border-line px-5 pb-[22px] pt-[26px] md:px-7">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <h2 className="m-0 font-display text-[18px] font-semibold">{a.title}</h2>
                    <div className="flex items-center gap-[18px] text-[13px] text-slate">
                      <span className="flex items-center gap-[7px]"><span className="block h-[3px] w-[14px] bg-accent" />APIx</span>
                      <button type="button" aria-pressed={bench} onClick={() => setBench((x) => !x)} className={cx("flex items-center gap-[7px]", !bench && "opacity-50")}>
                        <span className="block h-[3px] w-[14px] bg-bench" />CPI Transport
                      </button>
                    </div>
                  </div>
                  <div className="mt-5">
                    <LineChart
                      height={340} min={min} max={max}
                      label={`${a.title}, APIx${bench ? " and CPI Transport" : ""}`}
                      xLabels={pickEvenly(a.points, X_TICKS[freq]).map((p) => periodLabel(p.period, freq))}
                      lines={[...(bench ? [{ values: b, color: "#94A5B0", width: 2, dash: "5 4" }] : []), { values: v, color: "#CF5C11", area: true }]}
                    />
                    <ChartTable caption={a.title} columns={["Period", "APIx", "CPI Transport"]} rows={a.points.map((p, i) => [p.period, p.value, b[i] ?? ""])} />
                  </div>
                </div>
              );
            }}
          </Async>

          <div className="flex flex-wrap items-start gap-7">
            <Async state={subs} skeleton={<div className="min-w-0 flex-[1_1_300px]"><SkeletonBlock height={220} label="Loading sub-indices" /></div>}>
              {(s) => (
                <>
                  <Card className="min-w-0 flex-[2_1_440px] overflow-x-auto !px-[26px] !py-6">
                    <CardTitle sub={`Weighted by passenger traffic share, ${s.weight_source}.`}>Sub-indices</CardTitle>
                    <DataTable
                      caption="Sub-indices" minWidth={430} rowKey={(r) => r.code} rows={s.items}
                      columns={[
                        { header: "Series", cell: (r) => (<><div className="font-medium">{r.name}</div><div className="mt-[2px] font-mono text-[11.5px] text-faint">{r.code}</div></>), className: "!py-[13px]" },
                        { header: "Weight", cell: (r) => r.weight.toFixed(3), className: "font-mono" },
                        { header: "Level", cell: (r) => r.level.toFixed(1), className: "font-mono font-medium" },
                        { header: "MoM", cell: (r) => <span className={cx("font-mono", r.mom >= 0.03 ? "text-red" : r.mom >= 0.01 ? "text-accent" : r.mom < 0 ? "text-green" : "text-[#4A5A66]")}>{pct(r.mom)}</span> },
                        { header: "12 months", cell: (r) => <Sparkline values={r.history} label={`${r.name} trend`} />, className: "w-[120px]" },
                      ]}
                    />
                  </Card>
                  <Card className="min-w-0 flex-[1_1_300px] !px-[26px] !py-6">
                    <CardTitle sub={`Percentage points of the ${pct(s.mom_total, 2)} move.`}>Contribution to monthly change</CardTitle>
                    <div className="mt-5 flex flex-col gap-4">
                      {s.contributions.map((c) => {
                        const w = Math.min(50, Math.max(1.5, Math.abs(c.pp) * 38));
                        const color = c.pp < 0 ? "#157A47" : c.pp >= 0.3 ? "#CF5C11" : "#4A5A66";
                        return (
                          <div key={c.code}>
                            <div className="mb-[6px] flex justify-between text-[13px]"><span className="text-slate">{c.name}</span><span className="font-mono text-[13px] font-medium">{pp(c.pp)}</span></div>
                            <div className="relative h-[10px] bg-wash-bar" aria-hidden>
                              <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                              <div className="absolute inset-y-0" style={{ left: `${c.pp < 0 ? 50 - w : 50}%`, width: `${w}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </>
              )}
            </Async>
          </div>
        </div>
        <DashboardRail />
      </div>
    </Container>
  );
}
