/**
 * Reviews API
 *
 * Fetch, submit, helpful-vote, and report reviews.
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface ReviewInput {
  packageSlug: string;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewsResponse {
  reviews: {
    id: string;
    packageSlug: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    helpful: number;
    verified: boolean;
    createdAt: string;
  }[];
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

/**
 * Fetch reviews for a package
 */
export async function fetchReviews(packageSlug: string): Promise<ReviewsResponse> {
  const response = await fetch(`${API_BASE_URL}/reviews/${packageSlug}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reviews');
  }

  return data.data;
}

/**
 * Submit a new review (requires authentication)
 */
export async function submitReview(review: ReviewInput): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit review');
  }
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to mark review as helpful');
  }

  return data.data;
}

/**
 * Report a review
 */
export async function reportReview(reviewId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/report`, {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to report review');
  }
}
