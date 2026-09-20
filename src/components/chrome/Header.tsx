"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOverview } from "@/lib/api/client";
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

export function Header() {
  const path = usePathname();
  const ov = useApi(getOverview);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-6 px-4 py-[14px] md:px-10">
        <Link href="/" className="flex flex-none items-center gap-[14px] !text-ink no-underline hover:!text-ink hover:no-underline" aria-label="FareSankhya home">
          <Logo size={40} />
          <div className="flex flex-col leading-[1.15]">
            <span className="font-display text-[19px] font-semibold tracking-[-0.01em]">FareSankhya</span>
            <span className="text-[11.5px] uppercase tracking-[0.09em] text-muted">Airfare Price Index</span>
          </div>
        </Link>
        <div className="flex flex-none items-center gap-[18px]">
          <div className="text-right leading-[1.3]">
            <div className="font-mono text-[12px] font-medium text-ink">
              {ov.status === "ready" ? releaseStamp(ov.data.as_of) : "—"}
            </div>
            <div className="text-[11px] text-muted">Last index release</div>
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center border border-line bg-wash text-[12.5px] font-semibold text-[#4A5A66]" aria-label="Signed-in analyst: AR" role="img">AR</div>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <nav aria-label="Primary" className="mx-auto flex max-w-page flex-wrap gap-[2px] px-4 md:px-10">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-[3px] px-[14px] pb-[10px] pt-[13px] text-[13.5px] font-medium no-underline hover:no-underline ${
                  active ? "border-accent !text-ink" : "border-transparent !text-nav-idle hover:!text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
