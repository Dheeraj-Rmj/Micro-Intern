import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";

/**
 * API Client — Axios instance with authentication interceptors.
 *
 * Design:
 * - Base URL from env — no hardcoded URLs anywhere in the app
 * - Request interceptor: attaches Bearer token from cookie/memory store
 * - Response interceptor: handles 401 by silently refreshing token
 * - Retry: one automatic refresh attempt, then redirect to /auth/login
 *
 * Token storage strategy:
 * - Access token: in-memory (JavaScript variable) — XSS-resistant
 * - Refresh token: httpOnly cookie — CSRF-resistant
 *
 * This dual approach prevents both XSS and CSRF attacks simultaneously.
 */

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] || "https://micro-intern-4stz.onrender.com/api/v1";

// In-memory access token store
// This module is a singleton — token persists across component unmounts
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Create a typed Axios instance.
 * Called once at module initialization.
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Send httpOnly cookie with every request (for refresh token)
    timeout: 30_000,
  });

  // ── Request interceptor: attach access token ─────────────
  client.interceptors.request.use(
    (config) => {
      if (accessToken !== null) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      // Fix 411 Length Required errors on Render/Cloudflare for empty POST/PUT/PATCH/DELETE requests
      if (
        (config.method === "post" || config.method === "put" || config.method === "patch" || config.method === "delete") &&
        !config.data
      ) {
        config.data = {};
      }

      return config;
    },
    async (error: unknown) => await Promise.reject(error),
  );

  // ── Response interceptor: handle 401 with token refresh ──
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retried?: boolean };

      // 401 Unauthorized — attempt silent token refresh
      if (
        error.response?.status === 401 &&
        originalRequest._retried !== true &&
        !(originalRequest.url?.includes("/auth/refresh") ?? false) &&
        !(originalRequest.url?.includes("/auth/login") ?? false) &&
        !(originalRequest as any).skipAuthRefresh
      ) {
        originalRequest._retried = true;

        try {
          // Deduplicate concurrent refresh requests
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          if (refreshPromise === null) {
            refreshPromise = silentRefresh();
          }

          const newToken = await refreshPromise;
          refreshPromise = null;

          if (newToken !== null) {
            setAccessToken(newToken);
            // Retry original request with new token
            if (originalRequest.headers !== undefined) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            }
            return await client(originalRequest);
          }
        } catch {
          refreshPromise = null;
          // Refresh failed — clear token and redirect to login
          clearAccessToken();
          if (typeof window !== "undefined") {
            const isPublicRoute = window.location.pathname.startsWith("/users/ekyc");
            if (!isPublicRoute) {
              sessionStorage.setItem("microintern_current_route", "signin");
              window.location.href = "/";
            }
          }
        }
      }

      return await Promise.reject(error);
    },
  );

  return client;
}

/**
 * Silently refresh the access token using the httpOnly refresh cookie.
 */
async function silentRefresh(): Promise<string | null> {
  const refreshUrl = API_BASE_URL.endsWith("/api/v1")
    ? `${API_BASE_URL}/auth/refresh`
    : `${API_BASE_URL}/api/v1/auth/refresh`;

  const response = await axios.post<{ data: { accessToken: string } }>(
    refreshUrl,
    {},
    { withCredentials: true },
  );

  return response.data.data.accessToken;
}

/**
 * Typed API error — wraps Axios errors with our envelope error format.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    axiosError: AxiosError<{
      error: {
        code: string;
        message: string;
        details?: Array<{ field?: string; message: string }>;
      };
    }>,
  ) {
    const apiError = axiosError.response?.data?.error;
    super(apiError?.message ?? axiosError.message ?? "Request failed");
    this.name = "ApiError";
    this.status = axiosError.response?.status ?? 500;
    this.code = apiError?.code ?? "NETWORK_ERROR";
    if (apiError?.details) {
      this.details = apiError.details;
    }
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Convert Axios errors to typed ApiError.
 * Use in TanStack Query's throwOnError or catch blocks.
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    return new ApiError(
      error as AxiosError<{
        error: {
          code: string;
          message: string;
          details?: Array<{ field?: string; message: string }>;
        };
      }>,
    );
  }
  const generic = new ApiError({
    message: String(error),
    response: undefined,
  } as unknown as AxiosError<{ error: { code: string; message: string } }>);
  return generic;
}

// Singleton instance
export const apiClient = createApiClient();
