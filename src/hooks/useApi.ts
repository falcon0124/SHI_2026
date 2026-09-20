"use client";
import { useCallback, useEffect, useState } from "react";

export type ApiState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: string }
  | { status: "ready"; data: T; error?: undefined };

/** Runs a client fetcher; re-runs when `deps` change; exposes retry. */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<ApiState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    fetcher().then(
      (data) => live && setState({ status: "ready", data }),
      (e: unknown) => live && setState({ status: "error", error: e instanceof Error ? e.message : "Something went wrong." }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry } as ApiState<T> & { retry: () => void };
}
