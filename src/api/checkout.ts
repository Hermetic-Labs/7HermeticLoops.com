/**
 * Checkout API
 *
 * Stripe Checkout sessions (single + bulk) and purchase verification.
 */

import { API_BASE_URL } from './client';
import { Product } from '../types';

/**
 * Create a Stripe Checkout session for a single product and redirect
 */
export async function createCheckoutSession(product: Product): Promise<void> {
  if (!product.stripePriceId) {
    throw new Error('This product is not available for purchase yet');
  }

  const successUrl = `${window.location.origin}${import.meta.env.BASE_URL}success?session_id={CHECKOUT_SESSION_ID}&slug=${product.slug}`;
  const cancelUrl = `${window.location.origin}${import.meta.env.BASE_URL}product/${product.slug}`;

  const response = await fetch(`${API_BASE_URL}/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: product.stripePriceId,
      slug: product.slug,
      successUrl,
      cancelUrl,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  window.location.href = data.data.url;
}

/**
 * Verify a single-item purchase and get download access
 */
export async function verifyPurchase(sessionId: string): Promise<{
  packageSlug: string;
  downloadUrl: string;
  expiresIn: number;
}> {
  const response = await fetch(`${API_BASE_URL}/verify-purchase?session_id=${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify purchase');
  }

  return data.data;
}

// ── Bulk Checkout (Cart) ────────────────────────────────────────

export interface BulkCheckoutItem {
  priceId: string;
  slug: string;
  title: string;
}

/**
 * Create a Stripe Checkout session for multiple items and redirect
 */
export async function createBulkCheckoutSession(items: BulkCheckoutItem[]): Promise<void> {
  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  const invalidItems = items.filter(item => !item.priceId);
  if (invalidItems.length > 0) {
    throw new Error(`Some items are not available for purchase: ${invalidItems.map(i => i.title).join(', ')}`);
  }

  const slugs = items.map(i => i.slug).join(',');
  const successUrl = `${window.location.origin}${import.meta.env.BASE_URL}success?session_id={CHECKOUT_SESSION_ID}&slugs=${encodeURIComponent(slugs)}`;
  const cancelUrl = `${window.location.origin}${import.meta.env.BASE_URL}checkout`;

  const response = await fetch(`${API_BASE_URL}/create-bulk-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(item => ({
        priceId: item.priceId,
        slug: item.slug,
      })),
      successUrl,
      cancelUrl,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  window.location.href = data.data.url;
}

/**
 * Verify a bulk purchase and get download access for all items
 */
export async function verifyBulkPurchase(sessionId: string): Promise<{
  items: Array<{
    packageSlug: string;
    downloadUrl: string;
  }>;
  expiresIn: number;
}> {
  const response = await fetch(`${API_BASE_URL}/verify-bulk-purchase?session_id=${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify purchase');
  }

  return data.data;
}
