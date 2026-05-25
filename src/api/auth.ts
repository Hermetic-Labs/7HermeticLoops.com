/**
 * Authentication API
 *
 * Register, login (email / Google / Microsoft), 2FA, logout.
 * All token persistence goes through client.ts helpers.
 */

import {
  API_BASE_URL,
  AuthUser,
  getAuthToken,
  setAuthToken,
  setStoredUser,
  getStoredUser,
  clearAuthStorage,
  isAuthenticated,
} from './client';

// Re-export for consumers
export type { AuthUser };
export { getAuthToken, isAuthenticated, getStoredUser as getCurrentUser };

/**
 * Register a new user (email + password).
 * Does NOT auto-login — user must verify email first.
 */
export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(displayName ? { displayName } : {}) }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data.data;
}

/**
 * Verify email using token.
 * Auto-logs the user in on success.
 */
export async function verifyEmail(
  email: string,
  token: string,
): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Verification failed');
  }

  if (data.data?.token && data.data?.user) {
    setAuthToken(data.data.token);
    setStoredUser(data.data.user);
  }

  return data.data;
}

/**
 * Login with email + password.
 * If 2FA is enabled, returns { requires2FA, tempToken } instead of full auth.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user?: AuthUser; token?: string; requires2FA?: boolean; tempToken?: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // 2FA gate
  if (data.data.requires2FA) {
    return { requires2FA: true, tempToken: data.data.tempToken };
  }

  // Normal login
  setAuthToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

/**
 * Login via Google OAuth credential
 */
export async function apiLoginGoogle(
  credential: string,
): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to authenticate via Google');
  }

  if (data.data?.token && data.data?.user) {
    setAuthToken(data.data.token);
    setStoredUser(data.data.user);
  }

  return data.data;
}

/**
 * Login via Microsoft OAuth credential (MSAL ID token)
 */
export async function apiLoginMicrosoft(
  credential: string,
): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/microsoft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to authenticate via Microsoft');
  }

  if (data.data?.token && data.data?.user) {
    setAuthToken(data.data.token);
    setStoredUser(data.data.user);
  }

  return data.data;
}

/**
 * Complete 2FA login with a TOTP code
 */
export async function api2faLogin(
  tempToken: string,
  code: string,
): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, code }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '2FA verification failed');
  }

  setAuthToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

/**
 * Set up 2FA — generates a TOTP secret and QR URI
 */
export async function api2faSetup(): Promise<{ secret: string; otpauthUri: string }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '2FA setup failed');
  return data.data;
}

/**
 * Confirm 2FA setup with a valid code — enables 2FA and returns backup codes
 */
export async function api2faConfirm(
  code: string,
): Promise<{ enabled: boolean; backupCodes: string[] }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '2FA confirmation failed');
  return data.data;
}

/**
 * Logout — clears all stored auth data
 */
export function logout(): void {
  clearAuthStorage();
}

/**
 * Update user profile
 */
export async function updateProfile(
  profileData: { displayName?: string; bio?: string; avatarUrl?: string },
): Promise<AuthUser> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  if (data.data) {
    setStoredUser(data.data);
  }

  return data.data;
}
