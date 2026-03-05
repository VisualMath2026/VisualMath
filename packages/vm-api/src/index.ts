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
  baseUrl: string;
  timeoutMs?: number;
  getAccessToken?: () => string | null;
}

export interface RequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class VmApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly getAccessToken?: () => string | null;

  constructor(config: VmApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.getAccessToken = config.getAccessToken;
  }

  public get<T>(path: string, options?: Omit<RequestOptions, "path" | "method">): Promise<T> {
    return this.request<T>({
      path,
      method: "GET",
      ...options
    });
  }

  public post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "path" | "method" | "body">): Promise<T> {
    return this.request<T>({
      path,
      method: "POST",
      body,
      ...options
    });
  }

  public put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "path" | "method" | "body">): Promise<T> {
    return this.request<T>({
      path,
      method: "PUT",
      body,
      ...options
    });
  }

  public patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "path" | "method" | "body">): Promise<T> {
    return this.request<T>({
      path,
      method: "PATCH",
      body,
      ...options
    });
  }

  public delete<T>(path: string, options?: Omit<RequestOptions, "path" | "method">): Promise<T> {
    return this.request<T>({
      path,
      method: "DELETE",
      ...options
    });
  }

  public async request<T>(options: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch(this.buildUrl(options.path), {
        method: options.method ?? "GET",
        headers: this.buildHeaders(options.headers, options.body),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");

      const responseBody = isJson
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "");

      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          responseBody
        );
      }

      return responseBody as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unknown network error",
        0
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private buildHeaders(
    customHeaders?: Record<string, string>,
    body?: unknown
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...customHeaders
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getAccessToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}
export interface VmSocketConfig {
  url: string;
  getAccessToken?: () => string | null;
  reconnectIntervalMs?: number;
  maxReconnectIntervalMs?: number;
}

export type VmSocketStatus = "idle" | "connecting" | "open" | "closed";

export class VmSocketClient {
  private readonly url: string;
  private readonly getAccessToken?: () => string | null;
  private readonly reconnectIntervalMs: number;
  private readonly maxReconnectIntervalMs: number;

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private manuallyClosed = false;
  private status: VmSocketStatus = "idle";

  private readonly messageListeners = new Set<(data: unknown) => void>();
  private readonly statusListeners = new Set<(status: VmSocketStatus) => void>();

  constructor(config: VmSocketConfig) {
    this.url = config.url;
    this.getAccessToken = config.getAccessToken;
    this.reconnectIntervalMs = config.reconnectIntervalMs ?? 1000;
    this.maxReconnectIntervalMs = config.maxReconnectIntervalMs ?? 10000;
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.manuallyClosed = false;
    this.setStatus("connecting");

    const socketUrl = this.buildSocketUrl();
    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus("open");
    };

    this.socket.onmessage = (event: MessageEvent<string>) => {
      const parsed = this.safeParse(event.data);
      for (const listener of this.messageListeners) {
        listener(parsed);
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.setStatus("closed");

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = () => {
      // Ошибка детали не гарантирует, onclose обычно сработает следом.
    };
  }

  public disconnect(): void {
    this.manuallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.setStatus("closed");
  }

  public send(data: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    this.socket.send(JSON.stringify(data));
  }

  public onMessage(listener: (data: unknown) => void): () => void {
    this.messageListeners.add(listener);

    return () => {
      this.messageListeners.delete(listener);
    };
  }

  public onStatusChange(listener: (status: VmSocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.reconnectIntervalMs * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectIntervalMs
    );

    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private buildSocketUrl(): string {
    const token = this.getAccessToken?.();
    if (!token) {
      return this.url;
    }

    const separator = this.url.includes("?") ? "&" : "?";
    return `${this.url}${separator}token=${encodeURIComponent(token)}`;
  }

  private safeParse(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  private setStatus(status: VmSocketStatus): void {
    this.status = status;

    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}