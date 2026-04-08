const API_BASE = '/api/admin';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export async function adminGet<T = unknown>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: 'GET' });
}

export async function adminPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function adminPut<T = unknown>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDelete<T = unknown>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: 'DELETE' });
}
