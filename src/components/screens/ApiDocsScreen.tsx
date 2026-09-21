"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ENDPOINTS } from "@/lib/api/docs";
import { Card, Container, DataTable, Eyebrow, RuleCell, RuleGrid, cx } from "@/components/ui/primitives";

const BASE_URL = "https://apix.mospi.gov.in/v1";

const Code = ({ title, children }: { title: string; children: string }) => (
  <div className="flex min-w-0 flex-col border border-line">
    <div className="border-b border-line px-5 py-[14px] font-display text-[13px] font-semibold">{title}</div>
    <pre tabIndex={0} className="m-0 flex-1 overflow-auto bg-ink p-5 font-mono text-[12.5px] leading-[1.75] text-code-text">{children}</pre>
  </div>
);

export function ApiDocsScreen() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const idx = Math.min(Math.max(Number(sp.get("ep") ?? 0) || 0, 0), ENDPOINTS.length - 1);
  const ep = ENDPOINTS[idx];

  return (
    <Container className="pb-16 pt-9">
      <div className="border-b border-line pb-[22px]">
        <Eyebrow>Developers</Eyebrow>
        <h1 className="mt-2 font-display text-[30px] font-semibold tracking-[-0.015em]">APIx data API</h1>
        <p className="m-0 mt-3 max-w-[72ch] text-[15.5px] leading-[1.6] text-slate">REST endpoints over the published series. Token authentication, JSON and CSV responses, 120 requests per minute per key.</p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-[2px] self-start lg:sticky lg:top-[100px]">
          {ENDPOINTS.map((e, i) => (
            <button
              key={e.path}
              type="button"
              aria-pressed={i === idx}
              onClick={() => router.replace(`${path}?ep=${i}`, { scroll: false })}
              className={cx("row-hover flex min-h-11 w-full items-center gap-[10px] border border-l-4 px-[14px] py-3 text-left", i === idx ? "border-border-sel border-l-accent bg-wash" : "border-line-soft border-l-transparent bg-white hover:!border-l-line-strong")}
            >
              <span className="flex-none bg-green-wash px-[6px] py-[3px] font-mono text-[10.5px] font-semibold text-green">GET</span>
              <span className="truncate font-mono text-[12.5px] text-ink">{e.path}</span>
            </button>
          ))}
          <div className="mt-[18px] border border-line p-4">
            <div className="mb-2 font-display text-[13px] font-semibold">Base URL</div>
            <div className="break-all font-mono text-[12px] text-slate">{BASE_URL}</div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-7">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-green-wash px-[9px] py-[5px] font-mono text-[12px] font-semibold text-green">GET</span>
              <span className="font-mono text-[17px] font-medium">{ep.path}</span>
            </div>
            <p className="m-0 mt-4 max-w-[70ch] text-[15px] leading-[1.65] text-ink-body">{ep.desc}</p>
            <h3 className="mb-3 mt-[26px] font-display text-[14px] font-semibold">Query parameters</h3>
            <DataTable
              caption={`Parameters for ${ep.path}`} minWidth={480} rowKey={(p) => p.n} rows={ep.params}
              columns={[
                { header: "Name", cell: (p) => p.n, className: "font-mono font-medium" },
                { header: "Type", cell: (p) => p.t, className: "font-mono text-muted" },
                { header: "Description", cell: (p) => p.d, className: "text-slate" },
              ]}
            />
          </Card>

          <div className="grid gap-7 lg:grid-cols-2">
            <Code title="Request">{ep.req}</Code>
            <Code title="200 Response">{ep.res}</Code>
          </div>

          <RuleGrid min={220}>
            {[
              ["Authentication", "Bearer token in the Authorization header. Keys issued per institution."],
              ["Rate limit", "120 req/min. Bulk history via the CSV download endpoint."],
              ["Versioning", "Breaking changes ship under a new path prefix; v1 supported 24 months."],
            ].map(([t, d]) => (
              <RuleCell key={t} className="px-[22px] py-5">
                <div className="font-display text-[13.5px] font-semibold">{t}</div>
                <div className="mt-[6px] text-[13px] leading-[1.55] text-muted">{d}</div>
              </RuleCell>
            ))}
          </RuleGrid>
        </div>
      </div>
    </Container>
  );
}
