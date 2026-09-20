import type { ReactNode } from "react";
import { areaPath, bandPath, pointsFromSeries, yTicks } from "@/lib/chart";

/** Visually-hidden data table so chart data is available to assistive tech. */
export function ChartTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

export interface Line { values: number[]; color: string; width?: number; dash?: string; area?: boolean }

const Grid = ({ w, h }: { w: number; h: number }) => (
  <>
    {[0, 0.25, 0.5, 0.75].map((f) => (
      <line key={f} x1="0" y1={h * f} x2={w} y2={h * f} stroke="#EDF1F3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    ))}
    <line x1="0" y1={h} x2={w} y2={h} stroke="#CFD8DE" strokeWidth="1" vectorEffect="non-scaling-stroke" />
  </>
);

/** Frame: HTML y-axis column aligned to the SVG only (x labels sit outside the relative wrapper). */
function Frame({ height, ticks, xLabels, children, label }: { height: number; ticks: { label: string; top: string }[]; xLabels: string[]; children: ReactNode; label: string }) {
  return (
    <div className="pl-11">
      <div className="relative" style={{ height }}>
        <div className="absolute -left-11 bottom-0 top-0 w-10" aria-hidden>
          {ticks.map((t) => (
            <div key={t.top} className="absolute right-2 -translate-y-1/2 font-mono text-[11.5px] text-faint" style={{ top: t.top }}>{t.label}</div>
          ))}
        </div>
        <svg role="img" aria-label={label} viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="block w-full overflow-visible" style={{ height }}>
          {children}
        </svg>
      </div>
      <div className="mt-[10px] flex justify-between font-mono text-[11.5px] text-faint" aria-hidden>
        {xLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

export function LineChart({ lines, min, max, height, xLabels, label, fmt }: { lines: Line[]; min: number; max: number; height: number; xLabels: string[]; label: string; fmt?: (v: number) => string }) {
  return (
    <Frame height={height} ticks={yTicks(min, max, fmt)} xLabels={xLabels} label={label}>
      <Grid w={1000} h={height} />
      {lines.filter((l) => l.area).map((l, i) => (
        <path key={`a${i}`} d={areaPath(l.values, 1000, height, min, max)} fill={l.color} fillOpacity="0.07" />
      ))}
      {lines.map((l, i) => (
        <polyline key={i} points={pointsFromSeries(l.values, 1000, height, min, max)} fill="none" stroke={l.color} strokeWidth={l.width ?? 2.5} strokeDasharray={l.dash} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </Frame>
  );
}

export function BandChart({ lo, mean, hi, min, max, height, xLabels, label, fmt }: { lo: number[]; mean: number[]; hi: number[]; min: number; max: number; height: number; xLabels: string[]; label: string; fmt?: (v: number) => string }) {
  return (
    <Frame height={height} ticks={yTicks(min, max, fmt)} xLabels={xLabels} label={label}>
      <Grid w={1000} h={height} />
      <path d={bandPath(lo, hi, 1000, height, min, max)} fill="#0B5FA5" fillOpacity="0.12" />
      <polyline points={pointsFromSeries(mean, 1000, height, min, max)} fill="none" stroke="#0B5FA5" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </Frame>
  );
}

/** 110×30 sparkline, auto-scaled to ±0.5% of the series range. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const min = Math.min(...values) * 0.995;
  const max = Math.max(...values) * 1.005;
  return (
    <svg role="img" aria-label={label} viewBox="0 0 120 32" preserveAspectRatio="none" className="block h-[30px] w-[110px]">
      <polyline points={pointsFromSeries(values, 120, 28, min, max)} fill="none" stroke="#4A5A66" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
