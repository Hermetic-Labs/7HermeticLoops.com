/**
 * Questions API
 *
 * Fetch and submit Q&A for products.
 */

import { API_BASE_URL, getAuthToken } from './client';

export interface Question {
  id: string;
  packageSlug: string;
  userId: string;
  user: string;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  date: string;
  createdAt: string;
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
}

/**
 * Fetch questions for a package
 */
export async function fetchQuestions(packageSlug: string): Promise<QuestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/questions/${packageSlug}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch questions');
  }

  return data.data;
}

/**
 * Submit a new question (requires authentication)
 */
export async function submitQuestion(packageSlug: string, question: string): Promise<Question> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ packageSlug, question }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit question');
  }

  return data.data;
}
