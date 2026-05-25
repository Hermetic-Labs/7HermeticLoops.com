/**
 * Wishlist API
 *
 * Backend sync for authenticated users' wishlists.
 * Anonymous users use localStorage only (handled by WishlistContext).
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface WishlistItem {
  productId: string;
  productSlug: string;
  addedAt: string;
}

/**
 * Fetch user's wishlist from backend
 */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  const token = getAuthToken();
  if (!token) return []; // Anonymous users use localStorage only

  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Failed to fetch wishlist from backend:', data.error);
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.warn('Wishlist fetch error:', error);
    return [];
  }
}

/**
 * Add item to backend wishlist
 */
export async function addToBackendWishlist(productId: string, productSlug: string): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, productSlug }),
    });
  } catch (error) {
    console.warn('Failed to sync wishlist add:', error);
  }
}

/**
 * Remove item from backend wishlist
 */
export async function removeFromBackendWishlist(productSlug: string): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/wishlist/${productSlug}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch (error) {
    console.warn('Failed to sync wishlist remove:', error);
  }
}
