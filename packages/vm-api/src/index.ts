export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  public readonly status: number;
  public readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface VmApiConfig {
  /** Base URL вида https://example.com/api */
  baseUrl: string;
  /** Таймаут запроса в мс */
  timeoutMs?: number;
  /** Вернуть токен доступа (если есть) */
  getAccessToken?: () => string | null;
}