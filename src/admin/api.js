/* Thin client for the control center API (see /api/admin). */

const TOKEN_KEY = "storefront-admin-token";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: the session simply won't be remembered */
  }
}

export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.status = status;
    this.code = data.code;
    this.data = data;
  }
}

async function request(path, { method = "GET", body, raw = false, headers = {} } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(path, {
      method,
      cache: "no-store",
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined && !raw ? { "content-type": "application/json" } : {}),
        ...headers,
      },
      body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your internet connection and try again.", 0);
  }

  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    throw new ApiError(
      "The control center only works on your Vercel site (the server part isn't available here).",
      res.status,
      { code: "NO_API" }
    );
  }
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Please try again.", res.status, data);
  return data;
}

export const api = {
  login: (password) => request("/api/admin/login", { method: "POST", body: { password } }),
  session: () => request("/api/admin/session"),
  loadCatalog: () => request("/api/admin/catalog"),
  saveCatalog: (catalog, baseUpdatedAt) =>
    request("/api/admin/catalog", { method: "PUT", body: { catalog, baseUpdatedAt } }),
  upload: (blob, name) =>
    request(`/api/admin/upload?name=${encodeURIComponent(name)}`, {
      method: "POST",
      body: blob,
      raw: true,
      headers: { "content-type": blob.type },
    }),
};
