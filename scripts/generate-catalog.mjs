#!/usr/bin/env node
/**
 * generate-catalog.mjs
 *
 * Single source of truth for catalog.json generation.
 * Reads package manifests → writes public/catalog.json.
 *
 * PRICE CONTRACT:
 *   manifest "price": "free" | 0       → catalog price: 0     → frontend: "Coming Soon"
 *   manifest "price": 29.99            → catalog price: 29.99  → frontend: "$29.99"
 *   manifest "price": "29.99"          → catalog price: 29.99  → frontend: "$29.99"
 *   No /100 division. No cents. Dollars in, dollars out.
 *
 * Usage:
 *   node scripts/generate-catalog.mjs
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const CATALOG_PATH = join(ROOT, 'public', 'catalog.json');
const PRICES_PATH = join(ROOT, 'prices.json');

// ── Authors ─────────────────────────────────────────────────────

const AUTHORS = {
  'Hermetic Labs': {
    id: 'hermetic',
    name: 'Hermetic Labs',
    avatar: '',
    bio: 'Creators of innovative visualization, gaming, and productivity components for the EVE-OS ecosystem.',
    socialLinks: { website: 'https://hermetic.dev', discord: '#' },
    productCount: 0,
    totalSales: 8500,
  },
  'EVE Core Team': {
    id: 'eve-core',
    name: 'EVE Core Team',
    avatar: '',
    bio: 'Core modules and integrations for the EVE-OS platform.',
    socialLinks: { website: 'https://eve-os.dev' },
    productCount: 0,
    totalSales: 15000,
  },
  'EVE OS': {
    id: 'eve-os',
    name: 'EVE OS',
    avatar: '',
    bio: 'Official EVE OS modules and integrations.',
    socialLinks: { website: 'https://eve-os.dev' },
    productCount: 0,
    totalSales: 12000,
  },
};

// ── Price Parser (THE source of truth) ──────────────────────────

function parsePrice(raw) {
  // "free", 0, null, undefined → 0 (frontend renders as "Coming Soon")
  if (!raw || raw === 'free' || raw === 0) return 0;

  // Numeric → round to 2 decimals, pass through as dollars
  if (typeof raw === 'number') return Math.round(raw * 100) / 100;

  // String with a number in it → parse as dollars
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  return 0;
}

// ── Media Resolver ──────────────────────────────────────────────

function resolveMedia(pkgDir, slug, manifest) {
  const media = [];
  const assetsDir = join(pkgDir, 'assets');

  // Hero image
  const heroDir = join(assetsDir, 'hero');
  if (existsSync(heroDir)) {
    const heroFile = readdirSync(heroDir).find(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    if (heroFile) {
      media.push({ type: 'image', url: `packages/${slug}/assets/hero/${heroFile}` });
    }
  }

  // Gallery images
  if (existsSync(assetsDir)) {
    for (const dir of readdirSync(assetsDir, { withFileTypes: true })) {
      if (!dir.isDirectory() || !dir.name.startsWith('gallery')) continue;
      const files = readdirSync(join(assetsDir, dir.name));
      const img = files.find(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
      if (img) {
        media.push({ type: 'image', url: `packages/${slug}/assets/${dir.name}/${img}` });
      }
    }
  }

  // Video assets
  if (existsSync(assetsDir)) {
    const videoDir = join(assetsDir, 'video');
    if (existsSync(videoDir)) {
      for (const f of readdirSync(videoDir)) {
        if (/\.(mp4|webm|mov)$/i.test(f)) {
          media.push({ type: 'video', url: `packages/${slug}/assets/video/${f}` });
        }
      }
    }
  }

  // Fallback to manifest media
  if (media.length === 0 && manifest.media?.length) {
    media.push(...manifest.media);
  }

  // Fallback to icon
  if (media.length === 0) {
    const iconDir = join(assetsDir, 'icon');
    if (existsSync(iconDir)) {
      const iconFile = readdirSync(iconDir).find(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
      if (iconFile) {
        media.push({ type: 'image', url: `packages/${slug}/assets/icon/${iconFile}` });
      }
    }
  }

  return media.length > 0 ? media : [{ type: 'image', url: '' }];
}

// ── Main ────────────────────────────────────────────────────────

function generate() {
  console.log('[catalog] Reading packages from:', PACKAGES_DIR);

  if (!existsSync(PACKAGES_DIR)) {
    console.error('[catalog] packages/ directory not found');
    process.exit(1);
  }

  // Load Stripe price IDs (if any)
  let stripePrices = {};
  if (existsSync(PRICES_PATH)) {
    try {
      stripePrices = JSON.parse(readFileSync(PRICES_PATH, 'utf-8'));
    } catch { /* ignore */ }
  }

  const products = [];
  const categorySet = new Set();
  const authorCounts = {};

  const dirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name)
    .sort();

  for (const pkgName of dirs) {
    const manifestPath = join(PACKAGES_DIR, pkgName, 'manifest.json');
    if (!existsSync(manifestPath)) continue;

    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch (err) {
      console.warn(`[catalog] Skipping ${pkgName}: ${err.message}`);
      continue;
    }

    const slug = manifest.name || pkgName;
    const category = manifest.category || 'Uncategorized';
    const price = parsePrice(manifest.price);

    categorySet.add(category);

    // Resolve author
    const authorKey = manifest.author && AUTHORS[manifest.author] ? manifest.author : 'EVE Core Team';
    authorCounts[authorKey] = (authorCounts[authorKey] || 0) + 1;

    const product = {
      id: `p-${slug}`,
      title: manifest.displayName || manifest.name || pkgName,
      slug,
      price,
      discountPrice: manifest.discountPrice ? parsePrice(manifest.discountPrice) : null,
      stripePriceId: stripePrices[pkgName] || manifest.stripePriceId || null,
      author: { ...AUTHORS[authorKey] },
      category,
      class: manifest.class || (manifest.type ? manifest.type.charAt(0).toUpperCase() + manifest.type.slice(1) : 'Module'),
      domain: manifest.domain || null,
      domains: manifest.domains || (manifest.domain ? [manifest.domain] : []),
      relationships: manifest.relationships || null,
      media: resolveMedia(join(PACKAGES_DIR, pkgName), slug, manifest),
      description: manifest.description || '',
      techSpecs: [
        { label: 'Type', value: manifest.type ? manifest.type.charAt(0).toUpperCase() + manifest.type.slice(1) : 'Module' },
        { label: 'Version', value: manifest.version || '1.0.0' },
        ...(manifest.features || []).map(f => ({ label: 'Feature', value: f })),
      ],
      links: manifest.links || [{ label: 'Documentation', url: '#' }],
      questions: [],
      reviews: [],
      rating: 0,
      reviewCount: 0,
      releaseDate: manifest.releaseDate || null,
      featured: manifest.featured || false,
      isNew: manifest.isNew || false,
      downloadUrl: `https://hermeticlabs9f36.blob.core.windows.net/packages/zips/${slug}.zip`,
      bundleUrl: `https://hermeticlabs9f36.blob.core.windows.net/packages/bundles/${slug}.bundle.js`,
      documentation: manifest.documentation || undefined,
    };

    products.push(product);
  }

  // Set author product counts
  for (const product of products) {
    const key = Object.keys(AUTHORS).find(k => AUTHORS[k].id === product.author.id);
    if (key && authorCounts[key]) {
      product.author.productCount = authorCounts[key];
    }
  }

  const catalog = {
    version: '2.0.0',
    generated: new Date().toISOString(),
    baseUrl: 'https://hermeticlabs9f36.blob.core.windows.net/packages',
    products,
    categories: Array.from(categorySet).sort().map(c => ({
      id: c.toLowerCase().replace(/\s+/g, '-'),
      name: c,
    })),
    authors: Object.values(AUTHORS).filter(a => a.productCount > 0),
  };

  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));

  console.log(`[catalog] ✓ ${products.length} products, ${categorySet.size} categories`);
  console.log(`[catalog] → ${CATALOG_PATH}`);

  // Price audit — flag anything non-zero that has no Stripe ID
  const suspicious = products.filter(p => p.price > 0 && !p.stripePriceId);
  if (suspicious.length > 0) {
    console.warn(`\n[catalog] ⚠ ${suspicious.length} product(s) have a price but no stripePriceId:`);
    for (const p of suspicious) {
      console.warn(`  - ${p.slug}: $${p.price}`);
    }
  }
}

generate();
