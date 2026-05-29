export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/+$/, '');

type JsonBody = Record<string, unknown>;

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: JsonBody;
  headers?: Record<string, string>;
};

type ApiErrorBody = {
  message?: unknown;
  errors?: Array<{ message?: unknown }>;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const persisted = localStorage.getItem('auth-store');
    if (!persisted) return null;
    const parsed = JSON.parse(persisted);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function formatApiError(text: string, fallback: string) {
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text) as ApiErrorBody;
    const messages = parsed.errors
      ?.map((error) => error.message)
      .filter(
        (message): message is string => typeof message === 'string' && message.trim().length > 0,
      );

    if (messages?.length) {
      return messages.join(', ');
    }

    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall through to the raw text for non-JSON responses.
  }

  return text;
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, headers = {} }: FetchOptions = {},
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(formatApiError(text, `Request failed with ${res.status}`));
  }
  return (await res.json().catch(() => ({}))) as T;
}

export const api = {
  get: <T>(path: string, opts: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: JsonBody, opts: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: JsonBody, opts: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: JsonBody, opts: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
