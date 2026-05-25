/**
 * Seller Dashboard API
 *
 * Dashboard stats, sales history, status check, and onboarding.
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface SellerDashboardStats {
  totalSales: number;
  totalRevenue: number;
  thisMonthSales: number;
  thisMonthRevenue: number;
  averageOrderValue: number;
  topProducts: { slug: string; sales: number; revenue: number }[];
  recentSales: {
    id: string;
    packageSlug: string;
    amountCents: number;
    purchasedAt: string;
  }[];
}

export interface SellerInfo {
  id: string;
  displayName: string;
  verified: boolean;
  packageCount: number;
}

export interface SellerDashboardResponse {
  seller: SellerInfo;
  stats: SellerDashboardStats;
}

export interface SellerSale {
  id: string;
  packageSlug: string;
  amountCents: number;
  purchasedAt: string;
  netEarnings: number;
}

export interface SellerSalesResponse {
  sales: SellerSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch seller dashboard data (requires authentication)
 */
export async function fetchSellerDashboard(): Promise<SellerDashboardResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch seller dashboard');
  }

  return data.data;
}

/**
 * Fetch seller sales history (requires authentication)
 */
export async function fetchSellerSales(page = 1, limit = 20): Promise<SellerSalesResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/seller/sales?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch seller sales');
  }

  return data.data;
}

/**
 * Check seller status (requires authentication)
 */
export async function checkSellerStatus(): Promise<{
  isSeller: boolean;
  displayName?: string;
  verified?: boolean;
  stripeConnected?: boolean;
}> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/seller/status`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to check seller status');
  }

  return data.data;
}

/**
 * Start seller onboarding (requires authentication)
 */
export async function startSellerOnboarding(displayName: string): Promise<{
  stripeOnboardingUrl?: string;
}> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/seller/onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to start seller onboarding');
  }

  return data.data;
}
