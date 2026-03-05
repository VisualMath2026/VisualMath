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