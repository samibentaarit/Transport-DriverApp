import { resetAuthState, useAuthStore } from "@/store/authStore";
import { AppError } from "@/utils/errors";
import { ApiErrorShape } from "@/types/api";
import { env } from "@/services/env";

type RequestOptions = {
  retryOnAuthError?: boolean;
};

const REQUEST_TIMEOUT_MS = 10000;

function isJsonResponse(contentType: string | null) {
  return contentType?.includes("application/json");
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  if (isJsonResponse(response.headers.get("content-type"))) {
    return response.json();
  }

  return response.text();
}

export class ApiClient {
  private readonly baseUrl = env.apiUrl.replace(/\/$/, "");

  async get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { method: "GET" }, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { method: "POST", body }, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { method: "PUT", body }, options);
  }

  async delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { method: "DELETE" }, options);
  }

  private async request<T>(
    path: string,
    init: {
      method: string;
      body?: unknown;
    },
    options: RequestOptions = {}
  ): Promise<T> {
    const session = useAuthStore.getState().session;
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    const headers = new Headers({
      Accept: "application/json"
    });

    if (!isFormData) {
      headers.set("Content-Type", "application/json");
    }

    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: init.method,
        headers,
        body: init.body
          ? isFormData
            ? (init.body as FormData)
            : JSON.stringify(init.body)
          : undefined,
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError(
          `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Check EXPO_PUBLIC_API_URL and LAN connectivity.`,
          { status: 408 }
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if ((response.status === 401 || response.status === 419) && options.retryOnAuthError !== false && session) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request<T>(path, init, {
          retryOnAuthError: false
        });
      }
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      const error = payload as ApiErrorShape | string | null;
      const message =
        typeof error === "string"
          ? error
          : error?.message || `Request failed with status ${response.status}.`;

      throw new AppError(message, {
        status: response.status,
        validation: typeof error === "object" && error ? error.errors : undefined
      });
    }

    return payload as T;
  }

  private async tryRefreshToken() {
    const session = useAuthStore.getState().session;
    if (!session) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) {
        await resetAuthState();
        return false;
      }

      const payload = (await response.json()) as {
        token: string;
        token_type: string;
      };

      await useAuthStore.getState().setSession({
        accessToken: payload.token,
        tokenType: payload.token_type,
        user: session.user
      });

      return true;
    } catch {
      await resetAuthState();
      return false;
    }
  }
}

export const apiClient = new ApiClient();

