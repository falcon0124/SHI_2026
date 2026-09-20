import type { ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto max-w-page px-4 md:px-10", className)}>{children}</div>;
}

export function Eyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <div className={cx("font-mono text-[11.5px] font-medium uppercase tracking-[0.14em]", accent ? "text-accent" : "text-muted")}>
      {children}
    </div>
  );
}

export const Dek = ({ children }: { children: ReactNode }) => (
  <p className="m-0 mt-3 max-w-[72ch] text-[14.5px] leading-[1.6] text-muted">{children}</p>
);

export function PageHeader({ eyebrow, title, dek, children }: { eyebrow: string; title: string; dek?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-7 border-b border-line pb-[22px]">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-[30px] font-semibold tracking-[-0.015em]">{title}</h1>
        {dek && <Dek>{dek}</Dek>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <Tag className={cx("border border-line px-5 py-[22px] md:px-7 md:py-[26px]", className)}>{children}</Tag>;
}

export function CardTitle({ children, sub, level = 2 }: { children: ReactNode; sub?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className="mb-4">
      <H className={cx("m-0 font-display font-semibold", level === 2 ? "text-[18px]" : "text-[16px]")}>{children}</H>
      {sub && <p className="m-0 mt-1 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}

/** Rule grid: each cell carries a 1px ring; the parent is white so empty tracks stay white. */
export function RuleGrid({ children, min = 180, fill = false, className }: { children: ReactNode; min?: number; fill?: boolean; className?: string }) {
  return (
    <div
      className={cx("grid gap-px overflow-hidden border border-line bg-white", className)}
      style={{ gridTemplateColumns: `repeat(${fill ? "auto-fill" : "auto-fit"},minmax(${min}px,1fr))` }}
    >
      {children}
    </div>
  );
}
export const RuleCell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("bg-white shadow-[0_0_0_1px_#E3E8EB]", className)}>{children}</div>
);

export function StatTile({ label, value, tone, small }: { label: string; value: ReactNode; tone?: string; small?: boolean }) {
  return (
    <RuleCell className="px-[22px] py-5">
      <div className="text-[12.5px] uppercase tracking-[0.06em] text-muted">{label}</div>
      <div className={cx("whitespace-nowrap font-mono font-semibold", small ? "mt-[14px] text-[22px]" : "mt-2 text-[28px]", tone)}>{value}</div>
    </RuleCell>
  );
}

export function StatusDot({ color = "bg-green", label }: { color?: string; label?: string }) {
  return <span role={label ? "img" : undefined} aria-label={label} className={cx("block h-2 w-2 flex-none rounded-full", color)} />;
}

const TAGS = {
  red: "bg-red-wash text-red",
  warn: "bg-accent-tag-bg text-accent-dark",
  neutral: "bg-wash-bar text-[#4A5A66]",
} as const;
export function Tag({ tone, children }: { tone: keyof typeof TAGS; children: ReactNode }) {
  return <span className={cx("whitespace-nowrap px-[9px] py-1 text-[12px] font-medium", TAGS[tone])}>{children}</span>;
}

/** Horizontal bar on a track. `width` is a percentage 0–100. */
export function BarRow({
  label, value, width, color, labelW = 96, valueW = 70, height = 18, valueColor,
}: { label: string; value: string; width: number; color: string; labelW?: number; valueW?: number; height?: number; valueColor?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-none truncate text-[13px] text-slate" style={{ width: labelW }}>{label}</span>
      <span className="relative min-w-0 flex-1 bg-wash-bar" style={{ height }} aria-hidden>
        <span className="absolute inset-y-0 left-0" style={{ width: `${width}%`, background: color }} />
      </span>
      <span className={cx("flex-none text-right font-mono text-[13px] font-medium", valueColor)} style={{ width: valueW }}>{value}</span>
    </div>
  );
}

export function Button({ variant = "secondary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      {...p}
      className={cx(
        "px-[22px] py-[13px] text-[14.5px] font-medium",
        variant === "primary" ? "border-0 bg-ink text-white hover:bg-[#1c2f3f]" : "border border-border-btn bg-white text-ink hover:border-ink",
        className,
      )}
    />
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex border border-border-input">
      {options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={cx(
            "px-[18px] py-[9px] text-[13.5px] font-medium",
            i < options.length - 1 && "border-r border-border-input",
            o.id === value ? "bg-ink text-white" : "bg-white text-[#4A5A66] hover:bg-wash",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export interface Column<T> { header: string; cell: (row: T) => ReactNode; className?: string }

export function DataTable<T>({ columns, rows, rowKey, caption, minWidth = 520 }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; caption: string; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-[1.5px] border-ink text-left">
            {columns.map((c) => (
              <th key={c.header} scope="col" className="pb-[9px] pr-3 text-[12px] font-semibold uppercase tracking-[0.07em] text-[#4A5A66]">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-line-soft">
              {columns.map((c) => (
                <td key={c.header} className={cx("py-3 pr-3", c.className)}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
