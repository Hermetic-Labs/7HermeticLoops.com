/**
 * Shared API Client
 *
 * Single source of truth for:
 *  - API base URL
 *  - Auth token management (localStorage)
 *  - Typed fetch wrapper with error handling
 *
 * Every API module imports from here. No other file should
 * declare API_BASE_URL or read auth tokens directly.
 */

export const API_BASE_URL = 'https://hermetic-labs-api-cthme4a9gcgdfwfc.eastus-01.azurewebsites.net/api';

// ── Auth Token Storage ──────────────────────────────────────────

const AUTH_TOKEN_KEY = 'hermetic_auth_token';
const AUTH_USER_KEY = 'hermetic_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ── Fetch Helpers ───────────────────────────────────────────────

/**
 * Authenticated fetch — automatically attaches Bearer token if available.
 * Throws on non-OK responses with the server's error message.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Authenticated fetch that parses JSON and throws on error.
 * Most API calls should use this.
 */
export async function apiFetchJSON<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(endpoint, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data.data ?? data;
}

/**
 * Unauthenticated fetch for public endpoints (catalog, etc.)
 */
export async function publicFetch(url: string): Promise<Response> {
  return fetch(url);
}
