"use client";
import Link from "next/link";
import { getOverview } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, Skeleton } from "@/components/ui/Async";
import { RuleCell, RuleGrid, cx } from "@/components/ui/primitives";
import { deltaColor, hhmm, num, pct } from "@/lib/format";

const Band = ({ tint, children, className }: { tint?: boolean; children: React.ReactNode; className?: string }) => (
  <section className={cx("border-b border-line", tint ? "bg-wash" : "bg-white")}>
    <div className={cx("mx-auto max-w-page px-4 py-16 md:px-10 md:py-20", className)}>{children}</div>
  </section>
);

const Eyebrow = ({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) => (
  <div className={cx("font-mono text-[11.5px] font-medium uppercase tracking-[0.14em]", accent ? "text-accent" : "text-muted")}>{children}</div>
);

const STEPS = [
  { h: "Scrape", d: "Self-healing collectors read live economy fares from airline sites and online travel agents at fixed booking windows, several times a day." },
  { h: "Clean", d: "Every quote is reduced to one all-in price, cross-checked between airline and agent, and screened for error fares and outliers." },
  { h: "Compute", d: "A Jevons index per route is combined with traffic weights into one Modified Laspeyres series against a fixed base." },
  { h: "Deliver", d: "Daily, weekly and monthly series are published through the dashboard and a documented API, feeding CPI Transport & Communication." },
];

const AUDIENCES = [
  { h: "MoSPI & RBI", d: "A timely, traceable input for CPI Transport & Communication, and an early read on transport inflation between survey rounds." },
  { h: "DGCA & regulators", d: "Route-level fare bands and source comparisons that show where prices spike and how carriers and agents differ." },
  { h: "The travelling public", d: "A public account of how airfares actually move, published openly rather than inferred from a single day's quote." },
  { h: "Researchers", d: "Versioned series, documented methodology and a bulk CSV archive for reproducible work on pricing and demand." },
];

export function OverviewScreen() {
  const ov = useApi(getOverview);

  return (
    <>
      {/* Band 1 — Hero */}
      <Band className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow>Experimental statistic · Ministry of Statistics &amp; Programme Implementation</Eyebrow>
          <h1 className="mt-4 max-w-[15ch] text-pretty font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[52px]">
            India&apos;s airfares, measured every hour.
          </h1>
          <p className="mt-5 max-w-[54ch] text-pretty text-[18px] leading-[1.6] text-slate">
            FareSankhya turns millions of live fare quotes into one official airfare price index for the CPI Transport &amp; Communication group.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="bg-ink px-[26px] py-[15px] text-[14.5px] font-medium !text-white no-underline hover:bg-[#1c2f3f] hover:no-underline">View the index dashboard</Link>
            <Link href="/methodology" className="border border-border-btn bg-white px-[26px] py-[15px] text-[14.5px] font-medium !text-ink no-underline hover:border-ink hover:no-underline">Read the methodology</Link>
          </div>
        </div>
        <div className="border-l-[3px] border-accent pl-8">
          <Async state={ov} skeleton={<div role="status" className="space-y-3"><span className="sr-only">Loading headline</span><Skeleton h={12} w="50%" /><Skeleton h={72} w="70%" /><Skeleton h={14} w="60%" /></div>}>
            {(o) => (
              <>
                <div className="text-[12px] uppercase tracking-[0.1em] text-muted">APIx · {o.headline.period_label}</div>
                <div className="mt-2 font-mono text-[64px] font-semibold leading-none tracking-[-0.04em] md:text-[84px]">{o.headline.level.toFixed(1)}</div>
                <div className={cx("mt-3 font-mono text-[16px] font-medium", deltaColor(o.headline.mom))}>
                  {o.headline.mom < 0 ? "▼" : "▲"} {pct(o.headline.mom, 2, false)} on {o.headline.prev_period_label}
                </div>
                <div className="mt-2 text-[13.5px] text-muted">Base: {o.headline.base.replace("2024-01", "January 2024")}</div>
              </>
            )}
          </Async>
        </div>
      </Band>

      {/* Band 2 — The problem */}
      <Band tint className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-[72px]">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <Async state={ov} skeleton={<div className="mt-3"><Skeleton h={80} w="70%" /></div>}>
            {(o) => (
              <>
                <div className="mt-3 font-mono text-[64px] font-semibold leading-none text-accent md:text-[92px]">
                  {o.problem.swing_min_pct}–{o.problem.swing_max_pct}%
                </div>
                <p className="m-0 mt-4 max-w-[34ch] text-[15px] leading-[1.6] text-slate">the range a single airfare can swing within one day on a busy route.</p>
              </>
            )}
          </Async>
        </div>
        <div>
          <h2 className="m-0 font-display text-[28px] font-semibold leading-[1.2] md:text-[34px]">A price that moves hourly, observed once a month.</h2>
          <p className="mb-0 mt-5 text-[16.5px] leading-[1.7] text-ink-body">
            Consumer price collection visits an airfare the way it visits the price of rice: once, on a fixed day. The number it records is largely a coincidence of timing, not a measure of what travellers paid that month.
          </p>
          <p className="mb-0 mt-4 text-[16.5px] leading-[1.7] text-ink-body">
            FareSankhya reads each route{" "}
            <strong className="font-semibold">{ov.status === "ready" ? `~${ov.data.problem.observations_per_month}` : "many"} times a month per booking window</strong>, across airline sites and online travel agents at once, so the index reflects the whole month&apos;s price movement.
          </p>
        </div>
      </Band>

      {/* Band 3 — How it works */}
      <Band>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="m-0 mt-3 font-display text-[30px] font-semibold tracking-[-0.015em]">How a fare becomes a statistic</h2>
        <ol className="m-0 mt-10 grid list-none gap-9 p-0" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(178px,1fr))" }}>
          {STEPS.map((s, i) => (
            <li key={s.h} className={cx("border-t-[3px] pt-5", i === STEPS.length - 1 ? "border-accent" : "border-ink")}>
              <div className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-accent">Step {String(i + 1).padStart(2, "0")}</div>
              <h3 className="m-0 mt-2 font-display text-[21px] font-semibold">{s.h}</h3>
              <p className="m-0 mt-2 text-[14.5px] leading-[1.6] text-slate">{s.d}</p>
            </li>
          ))}
        </ol>
        <Link href="/methodology" className="mt-9 inline-block text-[14.5px] font-medium">Read the full methodology →</Link>
      </Band>

      {/* Band 4 — Live snapshot */}
      <Band tint className="!py-[72px]">
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center gap-x-[52px] gap-y-8 border border-[#DCE3E7] bg-white px-6 py-9 md:px-10">
          <Async state={ov} skeleton={<Skeleton h={90} w="100%" />}>
            {(o) => (
              <>
                <div>
                  <div className="font-mono text-[46px] font-semibold leading-none">{num(o.today.fares_read)}</div>
                  <div className="mt-2 text-[14px] text-slate">fares read across {o.collection.sources_total} sources, {hhmm(o.as_of)} IST</div>
                </div>
                <div className="hidden w-px self-stretch bg-line sm:block" aria-hidden />
                <div className="min-w-[240px] flex-1">
                  <p className="m-0 text-[15px] leading-[1.6] text-ink-body">The dashboard carries the full series at every frequency, with the route groups and movements behind the headline number.</p>
                  <Link href="/dashboard" className="mt-4 inline-block bg-ink px-[22px] py-3 text-[14px] font-medium !text-white no-underline hover:bg-[#1c2f3f] hover:no-underline">Open the dashboard</Link>
                </div>
              </>
            )}
          </Async>
        </div>
      </Band>

      {/* Band 5 — Who it's for */}
      <section className="bg-white">
        <div className="mx-auto max-w-page px-4 pb-[92px] pt-20 md:px-10">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2 className="m-0 mb-10 mt-3 font-display text-[30px] font-semibold tracking-[-0.015em]">Four audiences, one series</h2>
          <RuleGrid min={250}>
            {AUDIENCES.map((a) => (
              <RuleCell key={a.h} className="p-7">
                <h3 className="m-0 font-display text-[18px] font-semibold">{a.h}</h3>
                <p className="m-0 mt-3 text-[14.5px] leading-[1.6] text-slate">{a.d}</p>
              </RuleCell>
            ))}
          </RuleGrid>
        </div>
      </section>
    </>
  );
}
