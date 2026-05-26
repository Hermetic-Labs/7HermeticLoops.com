/**
 * Certificates API Client
 *
 * Fetch, verify, and display training certificates.
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface Certificate {
  certId: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  courseSlug: string;
  description: string;
  skills: string[];
  issuer: string;
  issuedAt: string;
  verificationUrl: string;
  linkedInUrl: string | null;
  status: string;
}

/**
 * Fetch certificates for a user (requires auth)
 */
export async function fetchUserCertificates(userId: string): Promise<Certificate[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/certificates/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch certificates');
  }

  return data.data.certificates;
}

/**
 * Verify a certificate by its public ID (no auth required)
 */
export async function verifyCertificate(certId: string): Promise<Certificate & { valid: boolean }> {
  const response = await fetch(`${API_BASE_URL}/certificates/verify/${certId}`);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Certificate not found');
  }

  return { ...data.data, valid: data.valid };
}
