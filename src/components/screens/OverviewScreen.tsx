"use client";
import Link from "next/link";
import { getOverview } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Async, Skeleton } from "@/components/ui/Async";
import { RuleCell, RuleGrid, cx } from "@/components/ui/primitives";
import { deltaColor, hhmm, num, pct } from "@/lib/format";

const Band = ({ tint, children, className }: { tint?: boolean; children: React.ReactNode; className?: string }) => (
  <section className={cx("border-b border-line", tint ? "bg-wash" : "bg-white")}>
    <div className={cx("mx-auto max-w-page px-[18px] py-12 md:px-10 md:py-20", className)}>{children}</div>
  </section>
);

const Eyebrow = ({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) => (
  <div className={cx("font-mono text-[11.5px] font-medium uppercase tracking-[0.14em]", accent ? "text-accent" : "text-muted")}>{children}</div>
);

const STEPS = [
  { h: "Scrape", d: "Five airline sites and six travel agents, four sweeps a day, on a fixed basket of six trunk city-pairs." },
  { h: "Clean", d: "Taxes, fees and fare classes normalised to one comparable all-in price; error fares caught by cross-source checks." },
  { h: "Compute", d: "A Jevons index per route, aggregated by a Modified Laspeyres weighted on passenger traffic." },
  { h: "Deliver", d: "Daily, weekly and monthly series published through dashboards and a public API into MoSPI and RBI workflows." },
];

const AUDIENCES = [
  { h: "MoSPI & RBI", d: "A defensible input to CPI Transport, and an early read on transport inflation between monthly releases." },
  { h: "DGCA & regulators", d: "Evidence on route-level pricing behaviour, surge patterns and competition on trunk corridors." },
  { h: "The travelling public", d: "A published, independent record of what flying actually costs — and when fares move most." },
  { h: "Researchers", d: "Open historical series and a documented API for academic and press analysis." },
];

export function OverviewScreen() {
  const ov = useApi(getOverview);

  return (
    <>
      {/* Band 1 — Hero */}
      <Band className="grid items-center gap-9 !pb-11 !pt-10 md:!pb-20 md:!pt-[88px] md:gap-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <Eyebrow>Experimental statistic · Ministry of Statistics &amp; Programme Implementation</Eyebrow>
          <h1 className="mt-4 max-w-[15ch] text-pretty font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] md:text-[52px] md:leading-[1.08]">
            India&apos;s airfares, measured every hour.
          </h1>
          <p className="mt-[22px] max-w-[54ch] text-pretty text-[18px] leading-[1.6] text-slate">
            FareSankhya turns millions of live fare quotes into one official airfare price index for the CPI Transport &amp; Communication group.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <Link href="/dashboard" className="press bg-ink px-[26px] py-[15px] text-[15px] font-medium !text-white no-underline hover:bg-[#1c2f3f] hover:no-underline">View the index dashboard</Link>
            <Link href="/methodology" className="press border border-border-btn bg-white px-[26px] py-[15px] text-[15px] font-medium !text-ink no-underline hover:border-ink hover:no-underline">Read the methodology</Link>
          </div>
        </div>
        <div className="border-l-[3px] border-accent pl-5 md:pl-8">
          <Async state={ov} skeleton={<div role="status" className="space-y-3"><span className="sr-only">Loading headline</span><Skeleton h={12} w="50%" /><Skeleton h={72} w="70%" /><Skeleton h={14} w="60%" /></div>}>
            {(o) => (
              <>
                <div className="text-[12px] uppercase tracking-[0.1em] text-muted">APIx · {o.headline.period_label} · illustrative</div>
                <div className="mt-2 font-mono text-[60px] font-semibold leading-none tracking-[-0.04em] md:text-[84px]">{o.headline.level.toFixed(1)}</div>
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
      <Band tint className="grid items-center gap-8 md:gap-[72px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <Async state={ov} skeleton={<div className="mt-3"><Skeleton h={80} w="70%" /></div>}>
            {(o) => (
              <>
                <div className="mt-3 font-mono text-[54px] font-semibold leading-none tracking-[-0.04em] text-accent md:text-[92px]">
                  {o.problem.swing_min_pct}–{o.problem.swing_max_pct}%
                </div>
                <p className="m-0 mt-4 max-w-[34ch] text-[15px] leading-[1.6] text-slate">the range a single airfare can swing within one day on a busy route.</p>
              </>
            )}
          </Async>
        </div>
        <div>
          <h2 className="m-0 max-w-[22ch] text-pretty font-display text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] md:text-[34px] md:leading-[1.2]">A price that moves hourly, observed once a month.</h2>
          <p className="mb-0 mt-5 text-[16.5px] leading-[1.7] text-ink-body">
            CPI collection visits an airfare the way it visits the price of rice — once, on a fixed day. Airfares are not rice. By the time a surveyor records one, the fare has already moved, and the number entering the index is a coincidence of timing rather than a measurement of the market.
          </p>
          <p className="mb-0 mt-4 text-[16.5px] leading-[1.7] text-ink-body">
            FareSankhya reads each route roughly{" "}
            <strong className="font-semibold">{ov.status === "ready" ? ov.data.problem.observations_per_month : "many"} times a month per booking window</strong>, across airline sites and travel agents at once, so the published figure reflects what travellers actually paid.
          </p>
        </div>
      </Band>

      {/* Band 3 — How it works */}
      <Band>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="m-0 mt-3 font-display text-[34px] font-semibold tracking-[-0.02em]">How a fare becomes a statistic</h2>
        <ol className="m-0 mt-8 grid list-none gap-7 p-0 md:mt-12 md:gap-9" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
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
      <Band tint className="!py-11 md:!py-[72px]">
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center gap-x-[52px] gap-y-[22px] border border-[#DCE3E7] bg-white px-[22px] py-[26px] md:px-10 md:py-9">
          <Async state={ov} skeleton={<Skeleton h={90} w="100%" />}>
            {(o) => (
              <>
                <div>
                  <div className="text-[12.5px] uppercase tracking-[0.1em] text-muted">Live snapshot · today</div>
                  <div className="mt-3 font-mono text-[46px] font-semibold leading-none tracking-[-0.03em]">{num(o.today.fares_read)}</div>
                  <div className="mt-2 text-[14.5px] text-slate">fares read across {o.collection.sources_total} sources, {hhmm(o.as_of)} IST</div>
                </div>
                <div className="hidden w-px self-stretch bg-line md:block" aria-hidden />
                <div className="min-w-[240px] flex-1">
                  <p className="m-0 text-[15px] leading-[1.6] text-ink-body">The index dashboard carries the full series, route sub-indices, contributions to the monthly change and CSV export.</p>
                  <Link href="/dashboard" className="mt-4 inline-block bg-ink px-[22px] py-3 text-[14px] font-medium !text-white no-underline hover:bg-[#1c2f3f] hover:no-underline">Open the dashboard</Link>
                </div>
              </>
            )}
          </Async>
        </div>
      </Band>

      {/* Band 5 — Who it's for */}
      <section className="bg-white">
        <div className="mx-auto max-w-page px-[18px] pb-14 pt-12 md:pb-[92px] md:pt-20 md:px-10">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2 className="m-0 mb-10 mt-3 font-display text-[34px] font-semibold tracking-[-0.02em]">Four audiences, one series</h2>
          <RuleGrid min={220}>
            {AUDIENCES.map((a) => (
              <RuleCell key={a.h} interactive className="px-[26px] py-7">
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
