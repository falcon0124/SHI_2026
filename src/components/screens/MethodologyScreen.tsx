"use client";
import { getBasket } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { pct } from "@/lib/format";

const PIPELINE = ["Basket definition", "Scheduled scraping", "Cleaning", "Index engine", "Validation", "Publication"];
const NAV = [["basket", "1. The basket"], ["collect", "2. Collection"], ["normal", "3. Normalisation"], ["formula", "4. Index formula"], ["publish", "5. Publication & revision"]];

const H2 = "m-0 mb-3 font-display text-[22px] font-semibold";
const P = "m-0 mb-4 text-[15.5px] leading-[1.7] text-ink-body";

export function MethodologyScreen() {
  const basket = useApi(getBasket);
  const b = basket.status === "ready" ? basket.data : null;

  return (
    <Container className="pb-16 pt-9">
      <div className="border-b border-line pb-[22px]">
        <Eyebrow>Documentation</Eyebrow>
        <h1 className="mt-2 font-display text-[30px] font-semibold tracking-[-0.015em]">Methodology</h1>
        <p className="m-0 mt-3 max-w-[72ch] text-[15.5px] leading-[1.6] text-slate">
          How a quoted airfare becomes an official statistic, from basket definition to published index.
          {b && <> Version {b.methodology_version}, {b.methodology_date}.</>}
        </p>
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="flex flex-col gap-[10px] self-start text-[13.5px] lg:sticky lg:top-[100px]">
          <div className="mb-[2px] text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">On this page</div>
          {NAV.map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}
        </nav>

        <article className="max-w-[76ch]">
          <ol className="m-0 mb-10 grid list-none gap-px border border-line bg-line p-0" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(112px,1fr))" }}>
            {PIPELINE.map((t, i) => (
              <li key={t} className="bg-white px-[14px] py-4">
                <div className="font-mono text-[11px] font-medium text-accent">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 text-[13.5px] font-medium leading-[1.3]">{t}</div>
              </li>
            ))}
          </ol>

          <h2 id="basket" className={H2}>1. The basket</h2>
          <p className={P}>
            The index covers {b ? b.pairs.length : "a fixed set of"} trunk city-pairs selected on DGCA domestic passenger volume
            {b && <>, together accounting for roughly {pct(b.seat_share, 0, false)} of scheduled domestic seats</>}. Each pair is priced in both directions, economy cabin, one adult, no ancillaries.
          </p>
          <div className="mb-7 border border-line bg-wash px-5 py-[18px] font-mono text-[13.5px] leading-[1.9] text-ink-body">
            {b ? b.pairs.map((p) => p.pair).join(" · ") : "Loading basket…"}
          </div>

          <h2 id="collect" className={H2}>2. Collection</h2>
          <p className={P}>Fares are read from five airline websites and six online travel agents at fixed booking windows of D-7, D-15 and D-30, sampled four times daily at 06:00, 12:00, 18:00 and 21:00 IST. Self-healing scrapers detect layout changes and fall back to the site&apos;s own fare API where one is exposed.</p>
          <p className="m-0 mb-7 text-[15.5px] leading-[1.7] text-ink-body">A monthly survey observes a price once. APIx observes each route roughly 30 times a month per booking window, which is what allows the index to register intraday volatility that the current CPI collection cannot.</p>

          <h2 id="normal" className={H2}>3. Normalisation</h2>
          <p className={P}>Every quote is reduced to a comparable all-in price: base fare plus statutory taxes and user development fees, excluding seat selection, baggage add-ons and convenience fees. Fare classes are mapped to a common economy definition, and airline-quoted prices are cross-checked against OTA quotes for the same flight number to catch error fares.</p>

          <h2 id="formula" className={H2}>4. Index formula</h2>
          <p className={P}>At the elementary level, where no expenditure weights exist within a route, the unweighted geometric mean of price relatives (Jevons) is used:</p>
          <div className="mb-5 border-l-4 border-accent bg-accent-wash px-6 py-5 font-mono text-[16px] leading-[1.7] text-ink overflow-x-auto" role="math" aria-label="Jevons index: I J equals the product over i of p t i divided by p 0 i, to the power one over n">
            I<sub>J</sub> = ∏ ( p<sub>t,i</sub> / p<sub>0,i</sub> )<sup>1/n</sup>
          </div>
          <p className={P}>Route sub-indices are then aggregated with a Modified Laspeyres using passenger-traffic weights held fixed for the reference year:</p>
          <div className="mb-5 border-l-4 border-blue bg-blue-wash px-6 py-5 font-mono text-[16px] leading-[1.7] text-ink overflow-x-auto" role="math" aria-label="APIx at time t equals the sum of weights w i times the ratio of route index at t to route index at base, times 100">
            APIx<sub>t</sub> = Σ w<sub>i</sub> · ( I<sub>J,i,t</sub> / I<sub>J,i,0</sub> ) × 100
          </div>
          <p className="m-0 mb-7 text-[15.5px] leading-[1.7] text-ink-body">
            Weights are reviewed annually against {b ? b.weight_source : "DGCA"} traffic data. The reference base is {b ? b.base.replace("2024-01", "January 2024") : "January 2024"} = 100.
          </p>

          <h2 id="publish" className={H2}>5. Publication &amp; revision</h2>
          <p className={P}>Daily and weekly series are published as experimental statistics. The monthly series is the input to CPI Transport &amp; Communication and is final on release; corrections, if any, are footnoted and carried in the next monthly bulletin rather than applied silently.</p>
        </article>
      </div>
    </Container>
  );
}
