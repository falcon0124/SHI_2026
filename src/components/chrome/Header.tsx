"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getBasket, getOverview } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import { releaseStamp } from "@/lib/format";
import { Logo } from "@/components/Logo";

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Index dashboard" },
  { href: "/routes", label: "Route explorer" },
  { href: "/quality", label: "Data quality" },
  { href: "/methodology", label: "Methodology" },
  { href: "/api-docs", label: "API docs" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function Header() {
  const path = usePathname();
  const ov = useApi(getOverview);
  const basket = useApi(getBasket);
  const [open, setOpen] = useState(false);

  // Sliding active underline (desktop tabs).
  const navRef = useRef<HTMLElement>(null);
  const [bar, setBar] = useState<{ left: number; top: number; width: number } | null>(null);
  const [barReady, setBarReady] = useState(false);
  const measure = useCallback(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el) return setBar(null);
    setBar({ left: el.offsetLeft, top: el.offsetTop + el.offsetHeight - 3, width: el.offsetWidth });
  }, []);
  useLayoutEffect(measure, [measure, path]);
  useEffect(() => {
    const t = requestAnimationFrame(() => setBarReady(true));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const o = ov.status === "ready" ? ov.data : null;
  const meta: Record<string, string> = {
    "/": "Start here",
    "/dashboard": o ? o.headline.level.toFixed(1) : "",
    "/routes": o ? `${o.collection.basket_pairs} pairs` : "",
    "/quality": o ? `${o.collection.sources_online} / ${o.collection.sources_total}` : "",
    "/methodology": basket.status === "ready" ? `v${basket.data.methodology_version}` : "",
    "/api-docs": "v1",
  };
  const stamp = o ? releaseStamp(o.as_of) : "—";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-[18px] py-3 md:px-10 md:py-[14px]">
        <Link href="/" className="flex flex-none items-center gap-[14px] !text-ink no-underline hover:!text-ink hover:no-underline" aria-label="FareSankhya home">
          <Logo size={40} />
          <div className="flex flex-col leading-[1.15]">
            <span className="font-display text-[19px] font-semibold tracking-[-0.01em]">FareSankhya</span>
            <span className="text-[11.5px] uppercase tracking-[0.09em] text-muted">Airfare Price Index</span>
          </div>
        </Link>
        <div className="flex flex-none items-center gap-[14px]">
          <div className="hidden text-right leading-[1.3] md:block">
            <div className="font-mono text-[12px] font-medium text-ink">{stamp}</div>
            <div className="text-[11px] text-muted">Data retrieved</div>
          </div>
          <div className="hidden h-[34px] w-[34px] items-center justify-center border border-line bg-wash text-[12.5px] font-semibold text-[#4A5A66] md:flex" aria-label="Signed-in analyst: AR" role="img">AR</div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="flex h-11 items-center gap-[10px] border border-border-btn bg-white px-[15px] text-[13.5px] font-medium text-ink md:hidden"
          >
            <span className="flex w-4 flex-col gap-[3.5px]" aria-hidden>
              <span className={`block h-[2px] bg-ink transition-transform duration-200 ease-ui ${open ? "translate-y-[5.5px] rotate-45" : ""}`} />
              <span className={`block h-[2px] bg-ink transition-opacity duration-200 ease-ui ${open ? "opacity-0" : ""}`} />
              <span className={`block h-[2px] bg-ink transition-transform duration-200 ease-ui ${open ? "-translate-y-[5.5px] -rotate-45" : ""}`} />
            </span>
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden border-t border-line-soft md:block">
        <nav ref={navRef} aria-label="Primary" className="relative mx-auto flex max-w-page flex-wrap gap-[2px] px-10">
          {NAV.map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap px-[14px] pb-[13px] pt-[13px] text-[13.5px] font-medium no-underline transition-colors duration-150 hover:no-underline ${
                  active ? "!text-ink" : "!text-nav-idle hover:!text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          {bar && (
            <span
              aria-hidden
              className={`absolute left-0 h-[3px] bg-accent ease-ui ${barReady ? "transition-[transform,width] duration-200" : ""}`}
              style={{ top: bar.top, width: bar.width, transform: `translateX(${bar.left}px)` }}
            />
          )}
        </nav>
      </div>

      {/* Mobile drawer: below the masthead, animated in and out */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`absolute inset-x-0 top-full border-b border-line bg-white px-[18px] pb-5 pt-[14px] transition-[opacity,transform,visibility] duration-200 ease-ui md:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="px-[2px] pb-[10px] pt-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Go to</div>
        <div className="flex flex-col gap-2">
          {NAV.map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                tabIndex={open ? 0 : -1}
                aria-current={active ? "page" : undefined}
                className={`row-hover flex min-h-[54px] items-center justify-between gap-3 border border-l-4 px-4 text-[15.5px] font-medium !text-ink no-underline hover:no-underline ${
                  active ? "border-border-sel border-l-accent bg-wash" : "border-line border-l-transparent bg-white"
                }`}
              >
                <span>{n.label}</span>
                <span className={`font-mono text-[11.5px] tracking-[0.08em] ${active ? "text-accent" : "text-faint"}`}>{meta[n.href]}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard" tabIndex={open ? 0 : -1} className="press flex min-h-12 flex-1 items-center justify-center bg-ink text-[14.5px] font-medium !text-white no-underline hover:no-underline">Dashboard</Link>
          <Link href="/methodology" tabIndex={open ? 0 : -1} className="press flex min-h-12 flex-1 items-center justify-center border border-border-btn bg-white text-[14.5px] font-medium !text-ink no-underline hover:no-underline">Methodology</Link>
        </div>
        <div className="mt-[14px] font-mono text-[12px] text-faint">Data retrieved · {stamp}</div>
      </div>
    </header>
  );
}
