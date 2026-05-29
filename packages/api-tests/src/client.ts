const BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';

type FetchOpts = {
  method?: string;
  body?: unknown;
  token?: string;
  orgId?: string;
};

export type ApiResponse<T> = {
  status: number;
  ok: boolean;
  data: T;
};

export async function req<T = unknown>(
  path: string,
  { method = 'GET', body, token, orgId }: FetchOpts = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (orgId) headers['x-org-id'] = orgId;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null as T;
  }

  return { status: res.status, ok: res.ok, data };
}

export const get = <T>(path: string, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
  req<T>(path, { ...opts, method: 'GET' });

export const post = <T>(path: string, body?: unknown, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
  req<T>(path, { ...opts, method: 'POST', body });

export const patch = <T>(path: string, body?: unknown, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
  req<T>(path, { ...opts, method: 'PATCH', body });

export const del = <T>(path: string, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
  req<T>(path, { ...opts, method: 'DELETE' });
