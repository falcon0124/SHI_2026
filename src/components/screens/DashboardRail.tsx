"use client";
import Link from "next/link";
import { getOverview } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, SkeletonBlock } from "@/components/ui/Async";
import { Card } from "@/components/ui/primitives";
import { pct } from "@/lib/format";

const moverColor = (d: number) => (d < 0 ? "#157A47" : d >= 0.06 ? "#B3261E" : d >= 0.03 ? "#CF5C11" : "#4A5A66");

/** Movers, collection status and release calendar (moved here from the homepage). */
export function DashboardRail() {
  const ov = useApi(getOverview);
  return (
    <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6" aria-label="Movers and collection status">
      <Async state={ov} skeleton={<SkeletonBlock height={200} label="Loading movers" />}>
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
                      <dt className="text-slate">{l}</dt>
                      <dd className="m-0 font-mono text-[13.5px] font-medium">{v}</dd>
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
    </aside>
  );
}
