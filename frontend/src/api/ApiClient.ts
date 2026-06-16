// Client API for SIMA-KIOSCO

export interface ApiFetchOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  _retried?: boolean;
}

// Storage helpers using LocalStorage
export function getAccessToken(): string | null {
  return localStorage.getItem("sima_access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("sima_refresh_token");
}

export function saveSessionAuth(accessToken: string, refreshToken: string) {
  localStorage.setItem("sima_access_token", accessToken);
  localStorage.setItem("sima_refresh_token", refreshToken);
}

export function clearSessionAuth() {
  localStorage.removeItem("sima_access_token");
  localStorage.removeItem("sima_refresh_token");
}

const DEFAULT_API_URL = "http://localhost:3000/api/v1";

function buildUrl(path: string) {
  const centralUrl = localStorage.getItem("sima_central_api_url") || DEFAULT_API_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${centralUrl}${path}`;
  return `${centralUrl}/${path}`;
}

function toErrorMessage(payload: any): string {
  if (!payload) return "Request failed";
  if (typeof payload === "string") return payload;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.details === "string") return payload.details;

  const details = payload.details;
  if (Array.isArray(details)) {
    const messages = details
      .map((d) => (typeof d?.message === "string" ? d.message : null))
      .filter(Boolean);
    if (messages.length) return messages.join("\n");
  }

  const errors = payload.errors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((e) => (typeof e?.msg === "string" ? e.msg : typeof e?.message === "string" ? e.message : null))
      .filter(Boolean);
    if (messages.length) return messages.join("\n");
  }

  return "Request failed";
}

export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No hay token de sesión; inicia sesión nuevamente");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth && !options._retried) {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error("No hay token de sesión; inicia sesión nuevamente");
    }

    const refreshApiResponse = await fetch(buildUrl("/auth/refresh-token"), {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refresh,
        token_refresh: refresh,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!refreshApiResponse.ok) {
      throw new Error("No se pudo renovar la sesion; inicia sesion nuevamente");
    }

    const refreshResponse = await refreshApiResponse.json().catch(() => null);

    if (!refreshResponse) {
      throw new Error("Respuesta invalida al renovar la sesion");
    }

    const refreshedAccessToken = refreshResponse?.session?.access_token || refreshResponse?.access_token;
    const refreshedRefreshToken =
      refreshResponse?.session?.refresh_token ?? refreshResponse?.session?.token_refresh ?? refreshResponse?.refresh_token;

    if (!refreshedAccessToken || !refreshedRefreshToken) {
      throw new Error("No se recibieron tokens validos al renovar la sesion");
    }

    saveSessionAuth(refreshedAccessToken, refreshedRefreshToken);

    return apiJson(path, {
      ...options,
      _retried: true,
    });
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload));
  }

  return payload as T;
}

const ApiClient = {
  apiJson,
  getAccessToken,
  getRefreshToken,
  saveSessionAuth,
  clearSessionAuth,
};

export default ApiClient;
