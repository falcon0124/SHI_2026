"use client";
import type { ReactNode } from "react";
import type { ApiState } from "@/hooks/useApi";

export function Skeleton({ h = 16, w = "100%", className = "" }: { h?: number | string; w?: number | string; className?: string }) {
  return <div aria-hidden className={`animate-pulse bg-wash-bar ${className}`} style={{ height: h, width: w }} />;
}

export function SkeletonBlock({ height = 240, label = "Loading" }: { height?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="border border-line p-6">
      <span className="sr-only">{label}…</span>
      <Skeleton h={18} w="40%" />
      <div className="mt-3"><Skeleton h={12} w="65%" /></div>
      <div className="mt-6"><Skeleton h={height} /></div>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-line border-l-4 border-l-red bg-red-wash/40 p-5">
      <div className="font-display text-[15.5px] font-semibold text-red">Could not load this data</div>
      <p className="m-0 mt-1 text-[13.5px] text-slate">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 border border-border-btn bg-white px-4 py-2 text-[13.5px] font-medium hover:border-ink">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border border-dashed border-line-strong bg-wash p-8 text-center">
      <div className="font-display text-[15.5px] font-semibold">{title}</div>
      {hint && <p className="m-0 mt-1 text-[13.5px] text-muted">{hint}</p>}
    </div>
  );
}

/** Renders the right state for an ApiState: skeleton, error (with retry), empty, or content. */
export function Async<T>({
  state, children, skeleton, isEmpty, empty,
}: {
  state: ApiState<T> & { retry: () => void };
  children: (data: T) => ReactNode;
  skeleton?: ReactNode;
  isEmpty?: (d: T) => boolean;
  empty?: { title: string; hint?: string };
}) {
  if (state.status === "loading") return <>{skeleton ?? <SkeletonBlock />}</>;
  if (state.status === "error") return <ErrorPanel message={state.error} onRetry={state.retry} />;
  if (isEmpty?.(state.data)) return <EmptyState title={empty?.title ?? "No data"} hint={empty?.hint} />;
  return <>{children(state.data)}</>;
}
