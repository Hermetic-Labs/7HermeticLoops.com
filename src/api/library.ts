/**
 * Library API
 *
 * User's purchased packages and download URLs.
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface LibraryItem {
  packageSlug: string;
  purchasedAt: string;
  transactionId: string;
  downloadAvailable: boolean;
}

/**
 * Fetch user's library (purchased packages)
 */
export async function fetchLibrary(): Promise<LibraryItem[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/library`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch library');
  }

  return data.data;
}

/**
 * Get a signed download URL for a purchased package
 */
export async function getPackageDownload(packageSlug: string): Promise<{
  downloadUrl: string;
  expiresIn: number;
}> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/download/${packageSlug}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get download');
  }

  return data.data;
}
