import { api, API_BASE_URL } from './api';

export interface ChatHistoryMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface ChatMessageResponse {
  reply: string;
  sources: string[];
  is_estimated: boolean;
}

export function sendChatMessage(
  message: string,
  history: ChatHistoryMessage[],
  userProfile?: Record<string, unknown>,
  uid?: string
) {
  return api.post<ChatMessageResponse>('/api/chat/message', { message, history, userProfile, uid });
}

export interface StreamChatCallbacks {
  onToken: (token: string) => void;
  onDone: (meta: { sources: string[]; is_estimated: boolean }) => void;
  onError?: (message: string) => void;
}

// The backend does a non-streaming tool-check pass before it starts streaming tokens - if the
// upstream LLM is congested, that first pass (and the connection itself) can hang with zero
// bytes sent, leaving the UI's "typing..." indicator spinning forever with no error and no
// visible failure. An overall deadline turns that into an honest, bounded error instead.
const STREAM_TIMEOUT_MS = 60_000;

export async function streamChatMessage(
  message: string,
  history: ChatHistoryMessage[],
  userProfile: Record<string, unknown> | undefined,
  callbacks: StreamChatCallbacks,
  uid?: string
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/api/chat/message/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, userProfile, uid }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        callbacks.onError?.('The AI is taking too long to respond. Please try again in a moment.');
        return;
      }
      throw err;
    }
    if (!res.ok || !res.body) {
      throw new Error(`API ${res.status}: ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      let done: boolean, value: Uint8Array | undefined;
      try {
        ({ done, value } = await reader.read());
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          callbacks.onError?.('The AI is taking too long to respond. Please try again in a moment.');
          return;
        }
        throw err;
      }
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) {
          callbacks.onError?.(event.error);
        } else if (event.token) {
          callbacks.onToken(event.token);
        } else if (event.done) {
          callbacks.onDone({ sources: event.sources ?? [], is_estimated: event.is_estimated ?? false });
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
