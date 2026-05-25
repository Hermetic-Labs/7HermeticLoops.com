/**
 * Catalog API
 *
 * Fetches and caches the product catalog.
 * DEV: reads from local catalog.json (served by Vite)
 * PROD: fetches from Azure Blob Storage, falls back to GitHub Pages
 */

import { Product, Category, Author } from '../types';

// Local catalog URL (for development - served by Vite, for production - GitHub Pages)
const LOCAL_CATALOG_URL = `${import.meta.env.BASE_URL}catalog.json`;

// Azure Blob Storage URL (for production)
const AZURE_CATALOG_URL = 'https://hermeticlabs9f36.blob.core.windows.net/packages/catalog.json';

const IS_DEV = import.meta.env.DEV;

interface Catalog {
  version: string;
  generated: string;
  baseUrl: string;
  products: Product[];
  categories: Category[];
  authors: Author[];
}

// Cache
let catalogCache: Catalog | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 300000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

/**
 * Fetch and cache the entire catalog.
 * DEV: Local catalog.json
 * PROD: Azure first, then GitHub Pages static catalog
 */
async function fetchCatalog(): Promise<Catalog> {
  if (catalogCache && isCacheValid()) {
    return catalogCache;
  }

  // In development, use local catalog
  if (IS_DEV) {
    try {
      console.log('[Exchange] DEV MODE - Fetching local catalog.json...');
      const response = await fetch(LOCAL_CATALOG_URL);

      if (response.ok) {
        const catalog: Catalog = await response.json();
        catalogCache = catalog;
        cacheTimestamp = Date.now();
        console.log(`[Exchange] Loaded ${catalog.products?.length || 0} products from local catalog`);
        return catalog;
      }
    } catch (error) {
      console.error('[Exchange] Failed to load local catalog:', error);
    }
  }

  // In production, try Azure first
  if (!IS_DEV) {
    try {
      console.log('[Exchange] Fetching catalog from Azure...');
      const response = await fetch(AZURE_CATALOG_URL);

      if (response.ok) {
        const catalog: Catalog = await response.json();
        catalogCache = catalog;
        cacheTimestamp = Date.now();
        console.log(`[Exchange] Loaded ${catalog.products?.length || 0} products from Azure`);
        return catalog;
      }
    } catch (error) {
      console.warn('[Exchange] Azure catalog unavailable, trying GitHub Pages:', error);
    }

    // Fallback to GitHub Pages static catalog
    try {
      console.log('[Exchange] Fetching catalog from GitHub Pages...');
      const response = await fetch(LOCAL_CATALOG_URL);

      if (response.ok) {
        const catalog: Catalog = await response.json();
        catalogCache = catalog;
        cacheTimestamp = Date.now();
        console.log(`[Exchange] Loaded ${catalog.products?.length || 0} products from GitHub Pages`);
        return catalog;
      }
    } catch (error) {
      console.error('[Exchange] GitHub Pages catalog unavailable:', error);
    }
  }

  throw new Error('Catalog unavailable. Please check your connection and try again.');
}

// ── Public API ──────────────────────────────────────────────────

export async function fetchProducts(options?: {
  domain?: string;
  author?: string;
  freeOnly?: boolean;
  search?: string;
}): Promise<Product[]> {
  const catalog = await fetchCatalog();
  let products = catalog.products;

  if (options?.domain) {
    products = products.filter(p => p.domain === options.domain || p.domains?.includes(options.domain as any));
  }
  if (options?.author) {
    products = products.filter(p => p.author.id === options.author);
  }
  if (options?.freeOnly) {
    products = products.filter(p => p.price === 0);
  }
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  return products;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const catalog = await fetchCatalog();
  const product = catalog.products.find(p => p.slug === slug);
  if (!product) return undefined;

  return {
    ...product,
    questions: product.questions || [],
    reviews: product.reviews || [],
    links: product.links || [],
    media: product.media || [],
    techSpecs: product.techSpecs || [],
    author: product.author || { id: 'unknown', name: 'Unknown', avatar: '', bio: '', socialLinks: {}, productCount: 0, totalSales: 0 },
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const catalog = await fetchCatalog();
  return catalog.categories;
}

export async function fetchAuthors(): Promise<Author[]> {
  const catalog = await fetchCatalog();
  return catalog.authors;
}

export async function fetchAuthorById(id: string): Promise<Author | undefined> {
  const catalog = await fetchCatalog();
  return catalog.authors.find(a => a.id === id);
}

export async function fetchFeaturedProducts(limit = 6): Promise<Product[]> {
  const catalog = await fetchCatalog();
  return catalog.products.filter(p => p.featured).slice(0, limit);
}

export async function fetchNewProducts(limit = 6): Promise<Product[]> {
  const catalog = await fetchCatalog();
  return catalog.products.filter(p => p.isNew).slice(0, limit);
}

export function clearCache(): void {
  catalogCache = null;
  cacheTimestamp = 0;
}

export function getDownloadUrl(product: Product): string | undefined {
  return product.downloadUrl;
}
