export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// AI-backed endpoints call an LLM that can occasionally hang or get rate-limited upstream -
// without a timeout, a stuck request leaves the UI spinning forever with no feedback at all.
const DEFAULT_TIMEOUT_MS = 45_000;

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('The AI service is taking too long to respond. Please try again in a moment.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errText || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function apiFetchForm<T>(path: string, form: FormData, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    // No Content-Type header here - the browser sets it (with the multipart boundary) itself.
    res = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      ...options,
      method: options.method || 'POST',
      body: form,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('The server is taking too long to respond. Please try again in a moment.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errText || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) => apiFetchForm<T>(path, form),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
