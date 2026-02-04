import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
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
  if (url.startsWith('/')) return url;
  return `${import.meta.env.BASE_URL}${url}`;
}
