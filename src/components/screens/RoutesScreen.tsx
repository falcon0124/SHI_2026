"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getRouteDetail, getRoutes } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, SkeletonBlock } from "@/components/ui/Async";
import { BarRow, Card, Container, PageHeader, cx } from "@/components/ui/primitives";
import { BandChart, ChartTable, LineChart } from "@/components/charts/charts";
import { niceScaleStep, pickEvenly } from "@/lib/chart";
import { dayLabel, deltaColor, inr, num, pct } from "@/lib/format";
import type { RouteSummary } from "@/lib/api/schemas";

const slug = (pair: string) => pair.replace("–", "-");
const k = (v: number) => `₹${(v / 1000).toFixed(0)}k`;

function RouteRail({ routes, selected, onSelect }: { routes: RouteSummary[]; selected: string; onSelect: (p: string) => void }) {
  const [q, setQ] = useState("");
  const shown = routes.filter((r) => `${r.pair} ${r.cities}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <aside className="flex flex-col gap-[2px]">
      <input
        aria-label="Search routes or airports"
        placeholder="Search routes or airports"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-[14px] w-full border border-border-input p-[11px_13px] text-[13.5px]"
      />
      {shown.length === 0 && <p className="m-0 text-[13px] text-muted">No routes match “{q}”.</p>}
      {shown.map((r) => {
        const sel = slug(r.pair) === selected;
        return (
          <button
            key={r.pair}
            type="button"
            aria-pressed={sel}
            onClick={() => onSelect(slug(r.pair))}
            className={cx("flex w-full items-center justify-between gap-[10px] border border-l-4 px-4 py-[14px] text-left", sel ? "border-border-sel border-l-accent bg-wash" : "border-line-soft border-l-transparent bg-white hover:bg-wash")}
          >
            <span>
              <span className="block font-mono text-[14.5px] font-medium text-ink">{r.pair}</span>
              <span className="mt-[3px] block text-[12px] text-muted">{r.cities}</span>
            </span>
            <span className={cx("font-mono text-[13px] font-medium", deltaColor(r.delta_30d))}>{pct(r.delta_30d)}</span>
          </button>
        );
      })}
    </aside>
  );
}

function RouteDetailView({ route, pair }: { route: RouteSummary; pair: string }) {
  const d = useApi(() => getRouteDetail(pair), [pair]);
  return (
    <div className="flex min-w-0 flex-col gap-7">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="m-0 font-display text-[24px] font-semibold">{route.pair} · {route.cities}</h2>
            <p className="m-0 mt-[7px] text-[13.5px] text-muted">{route.note}</p>
          </div>
          <dl className="m-0 flex gap-7">
            {[
              [route.index.toFixed(1), "Sub-index", ""],
              [inr(route.mean_fare_inr), "Mean fare, 30d", ""],
              [`${num(route.max_swing_pct)}%`, "Intraday swing, max", "text-red"],
            ].map(([v, l, c]) => (
              <div key={l}>
                <dd className={cx("m-0 font-mono text-[26px] font-semibold", c)}>{v}</dd>
                <dt className="text-[12px] text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-6">
          <div className="mb-[10px] text-[13px] text-slate">Daily fare band — cheapest, mean and dearest observation, last 30 days (₹)</div>
          <Async state={d} skeleton={<SkeletonBlock height={260} label="Loading fare band" />}>
            {(r) => {
              const { min, max } = niceScaleStep(r.band.flatMap((b) => [b.min, b.max]), 1000);
              return (
                <>
                  <BandChart
                    height={260} min={min} max={max} fmt={k}
                    lo={r.band.map((b) => b.min)} mean={r.band.map((b) => b.mean)} hi={r.band.map((b) => b.max)}
                    label={`${route.pair} daily fare band, last 30 days`}
                    xLabels={pickEvenly(r.band.map((_, i) => dayLabel(i, r.band.length)), 6)}
                  />
                  <ChartTable caption={`${route.pair} daily fares (₹)`} columns={["Date", "Cheapest", "Mean", "Dearest"]} rows={r.band.map((b) => [b.date, b.min, b.mean, b.max])} />
                </>
              );
            }}
          </Async>
        </div>
      </Card>

      <div className="grid gap-7 md:grid-cols-2">
        <Card className="!px-[26px] !py-6">
          <h3 className="m-0 mb-1 font-display text-[17px] font-semibold">Price by source</h3>
          <p className="m-0 mb-[18px] text-[12.5px] text-muted">Median quoted fare today, same cabin and date.</p>
          <Async state={d} skeleton={<SkeletonBlock height={180} label="Loading sources" />} isEmpty={(r) => r.by_source.length === 0} empty={{ title: "No source quotes today" }}>
            {(r) => {
              const top = Math.max(...r.by_source.map((s) => s.median_fare_inr));
              return (
                <div className="flex flex-col gap-[13px]">
                  {r.by_source.map((s) => (
                    <BarRow key={s.source} label={s.source} value={inr(s.median_fare_inr)} width={(s.median_fare_inr / top) * 100} color={s.flagged ? "#CF5C11" : s.kind === "Airline" ? "#0B5FA5" : "#7FA8C9"} />
                  ))}
                </div>
              );
            }}
          </Async>
        </Card>
        <Card className="!px-[26px] !py-6">
          <h3 className="m-0 mb-1 font-display text-[17px] font-semibold">Booking-window curve</h3>
          <p className="m-0 mb-[18px] text-[12.5px] text-muted">Mean fare by days to departure — the index samples at D-7, D-15 and D-30.</p>
          <Async state={d} skeleton={<SkeletonBlock height={190} label="Loading booking curve" />}>
            {(r) => {
              const v = r.booking_curve.map((c) => c.mean_fare_inr);
              const { min, max } = niceScaleStep(v, 1000);
              return (
                <>
                  <LineChart height={190} min={min} max={max} fmt={k} label={`${route.pair} mean fare by days to departure`} xLabels={["D-60", "D-45", "D-30", "D-15", "D-0"]} lines={[{ values: v, color: "#CF5C11" }]} />
                  <ChartTable caption="Mean fare by days to departure (₹)" columns={["Days to departure", "Mean fare"]} rows={r.booking_curve.map((c) => [c.days_to_departure, c.mean_fare_inr])} />
                </>
              );
            }}
          </Async>
        </Card>
      </div>
    </div>
  );
}

export function RoutesScreen() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const routes = useApi(getRoutes);
  const select = (p: string) => router.replace(`${path}?pair=${p}`, { scroll: false });

  return (
    <Container className="pb-14 pt-9">
      <PageHeader eyebrow="Route explorer" title="Basket city-pairs" />
      <div className="mt-7">
        <Async state={routes} skeleton={<SkeletonBlock height={320} label="Loading routes" />} isEmpty={(r) => r.routes.length === 0} empty={{ title: "No routes in the basket", hint: "The basket definition returned no city-pairs." }}>
          {({ routes: list }) => {
            const wanted = sp.get("pair");
            const route = list.find((r) => slug(r.pair) === wanted) ?? list[0];
            return (
              <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
                <RouteRail routes={list} selected={slug(route.pair)} onSelect={select} />
                <RouteDetailView route={route} pair={slug(route.pair)} />
              </div>
            );
          }}
        </Async>
      </div>
    </Container>
  );
}
