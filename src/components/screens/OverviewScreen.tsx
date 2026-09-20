"use client";
import Link from "next/link";
import { getApixSeries, getOverview } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, SkeletonBlock } from "@/components/ui/Async";
import { Card, Container, Eyebrow, RuleGrid, cx } from "@/components/ui/primitives";
import { LineChart, ChartTable } from "@/components/charts/charts";
import { niceScale, pickEvenly } from "@/lib/chart";
import { deltaColor, num, pct, periodLabel } from "@/lib/format";
import type { Overview } from "@/lib/api/schemas";

const moverColor = (d: number) => (d < 0 ? "#157A47" : d >= 0.06 ? "#B3261E" : d >= 0.03 ? "#CF5C11" : "#4A5A66");

function Hero({ ov }: { ov: ReturnType<typeof useApi<Overview>> }) {
  const d = ov.status === "ready" ? ov.data : null;
  return (
    <section className="border-b border-line bg-wash">
      <Container className="grid items-end gap-10 py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14 lg:pt-11">
        <div>
          <Eyebrow accent>Experimental statistic · {d?.release_label ?? "Release"}</Eyebrow>
          <h1 className="mt-[14px] max-w-[16ch] text-pretty font-display text-[36px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[44px]">
            India&apos;s airfares, measured every hour.
          </h1>
          <p className="mt-[18px] max-w-[58ch] text-pretty text-[16.5px] leading-[1.6] text-slate">
            APIx tracks live economy-class fares across {d ? d.collection.sources_total : "multiple"} booking sources and {d ? d.collection.basket_pairs : "several"} trunk city-pairs, normalises them to one comparable price, and publishes a daily, weekly and monthly index for the CPI Transport &amp; Communication group.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard" className="bg-ink px-[22px] py-[13px] text-[14.5px] font-medium !text-white no-underline hover:bg-[#1c2f3f] hover:no-underline">View the index dashboard</Link>
            <Link href="/methodology" className="border border-border-btn bg-white px-[22px] py-[13px] text-[14.5px] font-medium !text-ink no-underline hover:border-ink hover:no-underline">Read the methodology</Link>
          </div>
        </div>
        <div className="border border-[#DCE3E7] bg-white px-7 py-[26px]">
          <Async state={ov} skeleton={<div role="status" className="h-[230px] animate-pulse bg-wash-bar"><span className="sr-only">Loading headline</span></div>}>
            {(o) => (
              <>
                <div className="text-[12px] uppercase tracking-[0.1em] text-muted">APIx — All-India, monthly</div>
                <div className="mt-[10px] flex flex-wrap items-baseline gap-[14px]">
                  <span className="font-mono text-[56px] font-semibold leading-none tracking-[-0.03em]">{o.headline.level.toFixed(1)}</span>
                  <span className={cx("font-mono text-[15px] font-medium", deltaColor(o.headline.mom))}>{o.headline.mom < 0 ? "▼" : "▲"} {pct(o.headline.mom, 2, false)} MoM</span>
                </div>
                <div className="mt-2 text-[13px] text-muted">Base: {o.headline.base.replace("2024-01", "January 2024")}</div>
                <div className="my-[22px] h-px bg-line" />
                <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-5">
                  {[
                    [pct(o.headline.yoy), "Year on year"],
                    [num(o.today.fares_read), "Fares read today"],
                    [pct(o.today.scraper_uptime_30d, 1, false), "Scraper uptime, 30d"],
                    [pct(o.today.outlier_rate, 2, false), "Outliers rejected"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dd className="m-0 font-mono text-[20px] font-medium">{v}</dd>
                      <dt className="mt-[2px] text-[12.5px] text-muted">{l}</dt>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </Async>
        </div>
      </Container>
    </section>
  );
}

function ChartCard({ ov }: { ov: ReturnType<typeof useApi<Overview>> }) {
  const s = useApi(() => getApixSeries("monthly"));
  return (
    <Card>
      <Async state={s} skeleton={<SkeletonBlock height={290} label="Loading chart" />}>
        {(a) => {
          const v = a.points.map((p) => p.value);
          const b = a.benchmark.map((p) => p.value);
          const { min, max } = niceScale([...v, ...b]);
          const first = a.points[0].period, last = a.points[a.points.length - 1].period;
          return (
            <>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <h2 className="m-0 font-display text-[20px] font-semibold">APIx against official CPI Transport</h2>
                  <p className="m-0 mt-[6px] text-[13.5px] text-muted">
                    Index, {a.base.replace("2024-01", "Jan 2024")}. Monthly, {periodLabel(first, "monthly").replace(" ", " 20")} – {periodLabel(last, "monthly").replace(" ", " 20")}.
                  </p>
                </div>
                <div className="flex gap-[18px] text-[13px] text-slate">
                  <span className="flex items-center gap-[7px]"><span className="block h-[3px] w-[14px] bg-accent" />APIx</span>
                  <span className="flex items-center gap-[7px]"><span className="block h-[3px] w-[14px] bg-bench" />CPI Transport</span>
                </div>
              </div>
              <div className="mt-[22px]">
                <LineChart
                  height={290} min={min} max={max}
                  label="Monthly APIx index compared with CPI Transport"
                  xLabels={pickEvenly(a.points, 8).map((p) => periodLabel(p.period, "monthly"))}
                  lines={[{ values: b, color: "#94A5B0", width: 2, dash: "5 4" }, { values: v, color: "#CF5C11", area: true }]}
                />
                <ChartTable caption="APIx and CPI Transport, monthly" columns={["Period", "APIx", "CPI Transport"]} rows={a.points.map((p, i) => [p.period, p.value, b[i]])} />
              </div>
              {ov.status === "ready" && (
                <div className="mt-[18px] border-t border-line pt-[14px] text-[13px] leading-[1.5] text-muted">{ov.data.chart_note}</div>
              )}
            </>
          );
        }}
      </Async>
    </Card>
  );
}

function Rail({ ov }: { ov: ReturnType<typeof useApi<Overview>> }) {
  return (
    <div className="flex flex-col gap-6">
      <Async state={ov} skeleton={<SkeletonBlock height={200} label="Loading" />}>
        {(o) => {
          const maxAbs = Math.max(...o.movers.map((m) => Math.abs(m.delta_30d)));
          return (
            <>
              <Card className="!px-6 !py-[22px]">
                <h3 className="m-0 mb-1 font-display text-[15.5px] font-semibold">Largest movers, 30 days</h3>
                <p className="m-0 mb-[14px] text-[12.5px] text-muted">Route sub-index change</p>
                <div className="flex flex-col gap-3">
                  {o.movers.map((m) => (
                    <div key={m.pair} className="flex items-center gap-3">
                      <span className="w-[92px] flex-none font-mono text-[13px] font-medium">{m.pair}</span>
                      <span className="relative h-2 min-w-0 flex-1 bg-wash-bar" aria-hidden>
                        <span className="absolute inset-y-0 left-0" style={{ width: `${(Math.abs(m.delta_30d) / maxAbs) * 92}%`, background: moverColor(m.delta_30d) }} />
                      </span>
                      <span className="w-[58px] text-right font-mono text-[13px] font-medium" style={{ color: moverColor(m.delta_30d) }}>{pct(m.delta_30d)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="!px-6 !py-[22px]">
                <h3 className="m-0 mb-[14px] font-display text-[15.5px] font-semibold">Collection status</h3>
                <dl className="m-0 flex flex-col gap-[11px] text-[13.5px]">
                  {[
                    ["Sources online", `${o.collection.sources_online} / ${o.collection.sources_total}`],
                    ["Basket city-pairs", String(o.collection.basket_pairs)],
                    ["Readings per route / day", `~${o.collection.readings_per_route_day}`],
                    ["Next daily run", o.collection.next_daily_run],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-3">
                      <dt className="text-slate">{l}</dt><dd className="m-0 font-mono text-[13.5px] font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link href="/quality" className="mt-[18px] block w-full border border-border-btn bg-white p-[10px] text-center text-[13.5px] font-medium !text-ink no-underline hover:border-ink hover:no-underline">Open data quality</Link>
              </Card>
              <div className="border border-line border-l-4 border-l-accent bg-accent-wash px-6 py-5">
                <h3 className="m-0 mb-2 font-display text-[15.5px] font-semibold">Release calendar</h3>
                <div className="text-[13.5px] leading-[1.65] text-slate">
                  {o.calendar.daily} · {o.calendar.weekly} · {o.calendar.monthly}. {o.calendar.revisions}
                </div>
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}

export function OverviewScreen() {
  const ov = useApi(getOverview);
  return (
    <>
      <Hero ov={ov} />
      <section>
        <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <ChartCard ov={ov} />
          <Rail ov={ov} />
        </Container>
      </section>
    </>
  );
}
