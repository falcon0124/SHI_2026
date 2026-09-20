import type { ZodType } from "zod";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

/** GET a path from the real API and validate it against the contract. */
export async function getJson<T>(
  path: string,
  schema: ZodType<T>,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) qs.set(k, String(v));
  const url = `${BASE}${path}${qs.size ? `?${qs}` : ""}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Could not reach the data service.");
  }
  if (!res.ok) throw new ApiError(`The data service returned ${res.status}.`, res.status);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError("The data service returned an unexpected response shape.");
  return parsed.data;
}
