import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Coming Soon';
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function resolveAssetUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;

  const base = import.meta.env.BASE_URL; // e.g. "/hermetic-labs-exchange/" or "/"

  // If URL already includes the base path, return it as is
  // (Handling both with and without trailing slash cases)
  const baseNoSlash = base.replace(/\/$/, '');
  if (baseNoSlash && url.startsWith(baseNoSlash)) {
    return url;
  }

  // Ensure base ends with slash for joining
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  // Clean URL (remove leading slash if present) so we can join cleanly
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;

  return `${cleanBase}${cleanUrl}`;
}
