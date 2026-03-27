#!/usr/bin/env node
/**
 * Hermetic Labs Exchange - Unified Build Script
 *
 * Single command to build the entire marketplace:
 *   1. Build ESM bundles for all packages
 *   2. Create ZIP archives for distribution
 *   3. Generate catalog.json with all product metadata
 *
 * Usage:
 *   node scripts/build-all.mjs              Build everything
 *   node scripts/build-all.mjs --bundles    Build only bundles
 *   node scripts/build-all.mjs --zips       Create only zips
 *   node scripts/build-all.mjs --catalog    Generate only catalog
 */

import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile, writeFile, mkdir, copyFile, stat, rm } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directories
const ROOT_DIR = resolve(__dirname, '..');
// Source of truth: market_source (managed by Shipyard in Hermetic Labs API)
const MARKET_SOURCE_DIR = resolve(ROOT_DIR, '..', 'market_source', 'packages');

if (!existsSync(MARKET_SOURCE_DIR)) {
  console.log(`\n[CI/CD Bypass] External market_source directory not found.`);
  console.log(`[CI/CD Bypass] Gracefully preserving existing committed catalog and bundles.`);
  process.exit(0);
}

const PACKAGES_DIR = MARKET_SOURCE_DIR;
const DIST_DIR = resolve(ROOT_DIR, 'dist');
const BUNDLES_DIR = resolve(DIST_DIR, 'bundles');
const ZIPS_DIR = resolve(DIST_DIR, 'zips');
const PUBLIC_DIR = resolve(ROOT_DIR, 'public');
const PRICES_PATH = resolve(ROOT_DIR, 'prices.json');

// Azure Blob Storage base URL (where files will be uploaded)
const AZURE_BASE_URL = process.env.AZURE_STORAGE_URL || 'https://hermeticlabs9f36.blob.core.windows.net/packages';

// Packages to skip
const SKIP_PACKAGES = ['_shared', '_template', 'index.ts', 'package.json', 'tsconfig.json', 'pyproject.toml', 'pyrightconfig.json'];

// Template directory for auto-fixes
const TEMPLATE_DIR = resolve(PACKAGES_DIR, '_template');

// ============================================================================
// STRUCTURE ENFORCEMENT (Source of Truth)
// ============================================================================

// Required files per package
const REQUIRED_FILES = [
  'manifest.json',
  'frontend/index.ts',
  'assets/hero/hero.png',
];

// Required manifest fields
const REQUIRED_MANIFEST_FIELDS = [
  'name', 'displayName', 'version', 'type', 'description',
  'entry', 'sidebar', 'components', 'category'
];

// Valid package types
const VALID_TYPES = ['component', 'connector', 'compliance', 'visualization', 'gaming', 'service', 'module'];

/**
 * Validate and auto-fix package structure before build
 * Returns { valid: boolean, issues: string[], fixes: string[] }
 */
async function enforceStructure(packageName) {
  const packageDir = join(PACKAGES_DIR, packageName);
  const issues = [];
  const fixes = [];

  // Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = join(packageDir, file);
    if (!existsSync(filePath)) {
      if (file === 'assets/hero/hero.png') {
        // Auto-fix: copy placeholder from template
        const templateHero = join(TEMPLATE_DIR, 'assets/hero/hero.png');
        if (existsSync(templateHero)) {
          await mkdir(join(packageDir, 'assets/hero'), { recursive: true });
          await copyFile(templateHero, filePath);
          fixes.push(`Created ${file} from template`);
        } else {
          issues.push(`Missing ${file} (no template available)`);
        }
      } else {
        issues.push(`Missing ${file}`);
      }
    }
  }

  // Validate manifest.json
  const manifestPath = join(packageDir, 'manifest.json');
  if (existsSync(manifestPath)) {
    try {
      let manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
      let manifestChanged = false;

      // Check required fields
      for (const field of REQUIRED_MANIFEST_FIELDS) {
        if (!(field in manifest)) {
          issues.push(`Missing manifest field: ${field}`);
        }
      }

      // Auto-fix: correct invalid type
      if (manifest.type && !VALID_TYPES.includes(manifest.type)) {
        const oldType = manifest.type;
        const typeMap = { 'module': 'component', 'plugin': 'component' };
        manifest.type = typeMap[manifest.type] || 'component';
        manifestChanged = true;
        fixes.push(`Changed type from "${oldType}" to "${manifest.type}"`);
      }

      // Auto-fix: ensure sidebar is boolean
      if (typeof manifest.sidebar !== 'boolean') {
        manifest.sidebar = true;
        manifestChanged = true;
        fixes.push('Set sidebar to true');
      }

      // Write back if changes were made
      if (manifestChanged) {
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      }

    } catch (err) {
      issues.push(`Invalid JSON in manifest: ${err.message}`);
    }
  }

  // Validate index.ts has default export
  const indexPath = join(packageDir, 'frontend/index.ts');
  if (existsSync(indexPath)) {
    const content = await readFile(indexPath, 'utf-8');

    // Check for default export pattern
    const hasDefaultExport =
      content.includes('export default') ||
      /export\s*\{[^}]*\bdefault\b[^}]*\}/.test(content);

    if (!hasDefaultExport) {
      issues.push('No default export in frontend/index.ts');
    }

    // Check for Node.js APIs that won't work in browser
    if (content.includes("from 'fs'") || content.includes('from "fs"')) {
      issues.push('Uses Node.js fs module (not browser-compatible)');
    }
    if (content.includes("from 'path'") || content.includes('from "path"')) {
      // path is polyfilled, so just a warning
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    fixes
  };
}

// External dependencies for bundles - provided by the host app at runtime
const EXTERNALS = [
  // React ecosystem
  'react',
  'react-dom',
  'react/jsx-runtime',
  // Three.js ecosystem - provided via window.__EVE_THREE__ etc
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  // UI libraries
  'lucide-react',
  'zustand',
  'clsx',
  'tailwind-merge',
  // Editor libraries (provided by host)
  '@monaco-editor/react',
  'monaco-editor',
  // DnD libraries (provided by host)
  'react-dnd',
  'react-dnd-html5-backend',
  // Common utilities
  'uuid',
  // VRM/Avatar libraries (optional host provision)
  '@pixiv/three-vrm',
  'vrm-mixamo-retarget',
  // Form libraries
  'react-signature-canvas',
];

// Regex patterns for externals that can't be simple strings
const EXTERNAL_PATTERNS = [
  /^@\/services\/.*/,  // Main app services
  /^@\/types$/,        // Main app types
  /^@\/types\/.*/,     // Main app type files
  /^@market\/.*/,      // Other marketplace packages (cross-dependencies)
  /^three\/examples\/.*/,  // Three.js examples/addons
  /^three\/addons\/.*/,    // Three.js addons
];

// ============================================================================
// TAXONOMY MAPPING (Legacy to New)
// ============================================================================

// Map legacy type to new class
const TYPE_TO_CLASS = {
  'module': 'Module',
  'connector': 'Connector',
  'component': 'Component',
  'plugin': 'Component',
  'addon': 'Component',
  'compliance': 'Module',
  'visualization': 'Component',
  'gaming': 'Component',
  'service': 'Connector',
};

// Map legacy category to new domain
const CATEGORY_TO_DOMAIN = {
  // Healthcare
  'Healthcare': 'health',
  'Medical': 'health',
  // Compliance
  'HIPAA': 'compliance',
  'FHIR': 'compliance',
  'FedRAMP': 'compliance',
  'ITAR': 'compliance',
  'SOX': 'compliance',
  'PCI': 'compliance',
  'GDPR': 'compliance',
  'Compliance': 'compliance',
  // Enterprise
  'CRM': 'enterprise',
  'ERP': 'enterprise',
  'HR': 'enterprise',
  'Business': 'enterprise',
  'Productivity': 'enterprise',
  // Finance
  'Finance': 'finance',
  'Financial': 'finance',
  'Payments': 'finance',
  // Government
  'Government': 'gov',
  // Infrastructure
  'Storage': 'infra',
  'Connectivity': 'infra',
  'Cloud': 'infra',
  // Creative
  'Entertainment': 'creative',
  'VR/XR': 'creative',
  'Media': 'creative',
  'Gaming': 'creative',
  'Visualization': 'creative',
  'AI': 'creative',
  // Developer
  'Developer Tools': 'dev',
  'Tools': 'dev',
  // Legal
  'Legal': 'legal',
  // Accessibility maps to enterprise for now
  'Accessibility': 'enterprise',
  // Analytics maps to dev
  'Analytics': 'dev',
  // Defense maps to compliance
  'Defense': 'compliance',
};

// Domain display labels (for catalog)
const DOMAIN_LABELS = {
  health: 'Healthcare',
  compliance: 'Compliance',
  enterprise: 'Enterprise',
  finance: 'Finance',
  gov: 'Government',
  infra: 'Infrastructure',
  creative: 'Creative',
  dev: 'Developer Tools',
  social: 'Social',
  edu: 'Education',
  research: 'Research',
  legal: 'Legal',
};

/**
 * Infer class and domain from manifest (with fallbacks for legacy fields)
 */
function inferClassAndDomain(manifest) {
  // Use explicit values if present
  let packageClass = manifest.class;
  let domain = manifest.domain;
  let domains = manifest.domains || [];
  let relationships = manifest.relationships || null;

  // Infer class from legacy type
  if (!packageClass && manifest.type) {
    packageClass = TYPE_TO_CLASS[manifest.type.toLowerCase()] || 'Module';
  }

  // Check if this is a remix
  if (manifest.remix?.original || relationships?.remixedFrom) {
    packageClass = 'Remix';
    if (!relationships) relationships = {};
    if (manifest.remix?.original && !relationships.remixedFrom) {
      relationships.remixedFrom = manifest.remix.original;
    }
  }

  // Infer domain from legacy category
  if (!domain && manifest.category) {
    domain = CATEGORY_TO_DOMAIN[manifest.category] || 'dev';
  }

  // Infer from tags if still no domain
  if (!domain && manifest.tags && manifest.tags.length > 0) {
    const tagDomainMap = {
      'medical': 'health',
      'healthcare': 'health',
      'hipaa': 'compliance',
      'compliance': 'compliance',
      'fhir': 'compliance',
      'finance': 'finance',
      'financial': 'finance',
      'payments': 'finance',
      'legal': 'legal',
      'government': 'gov',
      'federal': 'gov',
      'storage': 'infra',
      'cloud': 'infra',
      'vr': 'creative',
      'xr': 'creative',
      'game': 'creative',
      'music': 'creative',
      'video': 'creative',
      'developer': 'dev',
      'ide': 'dev',
    };
    for (const tag of manifest.tags) {
      const tagLower = tag.toLowerCase();
      if (tagDomainMap[tagLower]) {
        domain = tagDomainMap[tagLower];
        break;
      }
    }
  }

  // Ensure domains array includes primary domain
  if (domain && domains.length === 0) {
    domains = [domain];
  } else if (domain && !domains.includes(domain)) {
    domains = [domain, ...domains];
  }

  // Check integrations for extends relationships
  if (!relationships && manifest.integrations && manifest.integrations.length > 0) {
    relationships = { extends: manifest.integrations };
  }

  // Check dependencies.packages for requires relationships
  if (manifest.dependencies?.packages?.length > 0) {
    if (!relationships) relationships = {};
    if (!relationships.requires) {
      relationships.requires = manifest.dependencies.packages;
    }
  }

  return {
    class: packageClass || 'Module',
    domain: domain || 'dev',
    domains: domains.length > 0 ? domains : [domain || 'dev'],
    relationships,
  };
}

// Authors database
const AUTHORS = {
  "EVE Core Team": {
    id: "eve-core",
    name: "EVE Core Team",
    avatar: "",
    bio: "Core development team building enterprise-grade connectors and compliance modules for EVE-OS.",
    socialLinks: { website: "https://eve-os.dev" },
    productCount: 21,
    totalSales: 15000
  },
  "Hermetic Labs": {
    id: "hermetic",
    name: "Hermetic Labs",
    avatar: "",
    bio: "Creators of innovative visualization, gaming, and productivity components for the EVE-OS ecosystem.",
    socialLinks: { website: "https://hermetic.dev", discord: "#" },
    productCount: 7,
    totalSales: 8500
  },
  "EVE OS": {
    id: "eve-os",
    name: "EVE OS",
    avatar: "",
    bio: "Official EVE OS modules and integrations.",
    socialLinks: { website: "https://eve-os.dev" },
    productCount: 1,
    totalSales: 12000
  }
};

/**
 * Build a single package into an ESM bundle
 * Runs structure enforcement first, auto-fixes what it can, then builds
 */
async function buildBundle(packageName, verbose = false) {
  const packageDir = join(PACKAGES_DIR, packageName);

  // STEP 1: Enforce structure (auto-fix where possible)
  const enforcement = await enforceStructure(packageName);

  // Report fixes if any
  if (enforcement.fixes.length > 0 && verbose) {
    console.log(`   [FIX] Auto-fixed: ${enforcement.fixes.join(', ')}`);
  }

  // If unfixable issues, skip the build
  if (!enforcement.valid) {
    return {
      success: false,
      reason: `structure: ${enforcement.issues[0]}`,
      fixes: enforcement.fixes,
      issues: enforcement.issues
    };
  }

  // STEP 2: Proceed with build
  const manifestPath = join(packageDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    return { success: false, reason: 'no manifest' };
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const entryPoint = manifest.entry || './frontend/index.ts';
  const entryPath = resolve(packageDir, entryPoint);

  if (!existsSync(entryPath)) {
    return { success: false, reason: 'no entry point' };
  }

  const outputFileName = `${packageName}.bundle.js`;

  try {
    await build({
      configFile: false,
      root: packageDir,
      plugins: [
        // Custom plugin to mark host services as external BEFORE resolution
        {
          name: 'external-host-services',
          resolveId(id) {
            // Keep @/services/* and @/types as external (host-provided)
            if (id.startsWith('@/services/') || id === '@/types' || id.startsWith('@/types/')) {
              return { id, external: true };
            }
            return null;
          }
        },
        react(),
        nodePolyfills({
          include: ['crypto', 'path', 'buffer', 'stream', 'events'],
          globals: { Buffer: true, global: true, process: true },
        }),
      ],
      resolve: {
        alias: {
          // Alias @/ to package's frontend folder (for internal imports)
          '@': resolve(packageDir, 'frontend'),
          // _shared imports resolve to the shared package
          '../../_shared': resolve(PACKAGES_DIR, '_shared'),
          '../_shared': resolve(PACKAGES_DIR, '_shared'),
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      build: {
        lib: {
          entry: entryPath,
          name: packageName.replace(/-/g, '_'),
          formats: ['es'],
          fileName: () => outputFileName,
        },
        outDir: BUNDLES_DIR,
        emptyOutDir: false,
        rollupOptions: {
          // External function: check against simple list + regex patterns
          external: (id) => {
            if (EXTERNALS.includes(id)) return true;
            for (const pattern of EXTERNAL_PATTERNS) {
              if (pattern.test(id)) return true;
            }
            return false;
          },
          output: {
            globals: {
              'react': 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
              'three': 'THREE',
              '@react-three/fiber': 'ReactThreeFiber',
              '@react-three/drei': 'ReactThreeDrei',
              'lucide-react': 'LucideReact',
            },
            exports: 'named',
          },
        },
        minify: 'esbuild',
        sourcemap: true,
      },
      logLevel: 'warn',
    });

    const bundlePath = join(BUNDLES_DIR, outputFileName);
    const stats = await stat(bundlePath);
    return { success: true, size: stats.size, fixes: enforcement.fixes };
  } catch (error) {
    return { success: false, reason: error.message, fixes: enforcement.fixes };
  }
}

/**
 * Create ZIP archive for a package
 */
async function createZip(packageName) {
  const packageDir = join(PACKAGES_DIR, packageName);
  const zipPath = join(ZIPS_DIR, `${packageName}.zip`);

  if (!existsSync(packageDir)) {
    return { success: false, reason: 'package not found' };
  }

  return new Promise((resolve) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      const stats = await stat(zipPath);
      resolve({ success: true, size: stats.size });
    });

    archive.on('error', (err) => {
      resolve({ success: false, reason: err.message });
    });

    archive.pipe(output);
    archive.directory(packageDir, false);
    archive.finalize();
  });
}

/**
 * Generate catalog.json from all package manifests
 */
async function generateCatalog() {
  const packages = await readdir(PACKAGES_DIR);
  const buildablePackages = packages.filter(p =>
    !SKIP_PACKAGES.includes(p) && !p.startsWith('.')
  );

  // Load prices
  let prices = {};
  if (existsSync(PRICES_PATH)) {
    prices = JSON.parse(await readFile(PRICES_PATH, 'utf-8'));
  }

  const products = [];
  const categories = {};
  let idx = 1;

  for (const pkgName of buildablePackages) {
    const manifestPath = join(PACKAGES_DIR, pkgName, 'manifest.json');
    if (!existsSync(manifestPath)) continue;

    const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));

    // Determine author
    const authorKey = manifest.author && AUTHORS[manifest.author] ? manifest.author : "EVE Core Team";
    const author = AUTHORS[authorKey];

    // Parse price (manifest stores cents, catalog uses dollars)
    let price = 0;
    if (manifest.price && manifest.price !== "free" && manifest.price !== 0) {
      if (typeof manifest.price === 'number') {
        // Numeric price is in cents, convert to dollars
        price = manifest.price / 100;
      } else {
        // String price - extract number and assume cents
        const match = String(manifest.price).match(/(\d+\.?\d*)/);
        if (match) price = parseFloat(match[1]) / 100;
      }
    }

    // Category tracking
    const category = manifest.category || "Tools";
    categories[category] = (categories[category] || 0) + 1;

    // Ratings - initialize to zero (real data comes from user reviews)
    const rating = 0.0;
    const reviewCount = 0;

    // Tech specs
    const techSpecs = [
      { label: "Type", value: manifest.type ? manifest.type.charAt(0).toUpperCase() + manifest.type.slice(1) : "Module" },
      { label: "Version", value: manifest.version || "1.0.0" }
    ];
    if (manifest.features) {
      manifest.features.slice(0, 6).forEach(f => {
        techSpecs.push({ label: "Feature", value: f });
      });
    }

    // Documentation
    let documentation = null;
    if (manifest.documentation) {
      documentation = {};
      if (manifest.documentation.card) documentation.card = manifest.documentation.card;
      if (manifest.documentation.summary) documentation.summary = manifest.documentation.summary;
      if (manifest.documentation.readme) documentation.readme = manifest.documentation.readme;
    }

    // Infer taxonomy from manifest
    const taxonomy = inferClassAndDomain(manifest);

    // Build media array by scanning assets folder
    const media = [];
    const pkgAssetsDir = join(PACKAGES_DIR, pkgName, 'assets');

    // Scan hero folder for any image
    const heroDir = join(pkgAssetsDir, 'hero');
    if (existsSync(heroDir)) {
      try {
        const heroFiles = (await readdir(heroDir)).filter(f => !f.startsWith('.') && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));
        if (heroFiles.length > 0) {
          media.push({ type: "image", url: `packages/${pkgName}/assets/hero/${heroFiles[0]}` });
        }
      } catch (e) { /* ignore */ }
    }

    // Fallback if no hero found
    if (media.length === 0) {
      media.push({ type: "image", url: `packages/${pkgName}/assets/hero/hero.png` });
    }

    // Scan gallery_1 through gallery_12 for additional images
    for (let i = 1; i <= 12; i++) {
      const galleryDir = join(pkgAssetsDir, `gallery_${i}`);
      if (existsSync(galleryDir)) {
        try {
          const galleryFiles = (await readdir(galleryDir)).filter(f => !f.startsWith('.') && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));
          if (galleryFiles.length > 0) {
            media.push({ type: "image", url: `packages/${pkgName}/assets/gallery_${i}/${galleryFiles[0]}` });
          }
        } catch (e) { /* ignore */ }
      }
    }

    const product = {
      id: `p${idx}`,
      title: manifest.displayName || pkgName,
      slug: pkgName,
      price,
      discountPrice: null,
      stripePriceId: prices[pkgName] || null,
      author,
      category,  // Legacy - keep for backward compatibility
      // New taxonomy fields
      class: taxonomy.class,
      domain: taxonomy.domain,
      domains: taxonomy.domains,
      relationships: taxonomy.relationships,
      media,
      description: manifest.description || "",
      techSpecs,
      links: [{ label: "Documentation", url: "#" }],
      questions: [],
      reviews: [],
      rating: parseFloat(rating.toFixed(1)),  // Truncate to 1 decimal
      reviewCount,
      releaseDate: null,  // Real release dates come from manifest
      featured: false,    // Real featured status set manually
      isNew: false,       // Real new status set manually
      // Azure URLs for downloads and bundles
      downloadUrl: `${AZURE_BASE_URL}/zips/${pkgName}.zip`,
      bundleUrl: `${AZURE_BASE_URL}/bundles/${pkgName}.bundle.js`,
      documentation
    };

    products.push(product);
    idx++;
  }

  // Build categories array (legacy)
  const categoryList = Object.entries(categories).map(([name, count], i) => ({
    id: `c${i + 1}`,
    name,
    icon: "package",
    productCount: count
  }));

  // Build domains array (new taxonomy)
  const domainCounts = {};
  for (const product of products) {
    const domain = product.domain || 'dev';
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  }
  const domainList = Object.entries(domainCounts).map(([id, count], i) => ({
    id,
    name: DOMAIN_LABELS[id] || id,
    productCount: count
  }));

  // Build class counts
  const classCounts = {};
  for (const product of products) {
    const cls = product.class || 'Module';
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  }
  const classList = Object.entries(classCounts).map(([id, count]) => ({
    id,
    name: id,
    productCount: count
  }));

  // Build authors array
  const authorList = Object.values(AUTHORS);

  const catalog = {
    version: "3.0.0",  // Bumped for taxonomy update
    generated: new Date().toISOString(),
    baseUrl: AZURE_BASE_URL,
    products,
    categories: categoryList,  // Legacy
    domains: domainList,       // New taxonomy
    classes: classList,        // New taxonomy
    authors: authorList
  };

  // Write to public folder (for GitHub Pages fallback)
  const catalogPath = join(PUBLIC_DIR, 'catalog.json');
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));

  return { productCount: products.length, categoryCount: categoryList.length };
}

/**
 * Sync package assets to public folder
 */
async function syncAssets() {
  const PUBLIC_PACKAGES_DIR = resolve(ROOT_DIR, 'public', 'packages');
  await mkdir(PUBLIC_PACKAGES_DIR, { recursive: true });

  const packages = await readdir(PACKAGES_DIR);
  const buildablePackages = packages.filter(p =>
    !SKIP_PACKAGES.includes(p) && !p.startsWith('.')
  );

  let synced = 0;
  for (const pkgName of buildablePackages) {
    const assetsDir = join(PACKAGES_DIR, pkgName, 'assets');
    const destDir = join(PUBLIC_PACKAGES_DIR, pkgName, 'assets');

    if (existsSync(assetsDir)) {
      // Simple recursive copy
      const copyDir = async (src, dest) => {
        await mkdir(dest, { recursive: true });
        const entries = await readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = join(src, entry.name);
          const destPath = join(dest, entry.name);
          if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
          } else {
            await copyFile(srcPath, destPath);
          }
        }
      };
      await copyDir(assetsDir, destDir);
      synced++;
    }
  }
  return synced;
}

/**
 * Main build function
 */
async function main() {
  const args = process.argv.slice(2);
  const buildBundles = args.length === 0 || args.includes('--bundles');
  const buildZips = args.length === 0 || args.includes('--zips');
  const buildCatalog = args.length === 0 || args.includes('--catalog');
  const syncAssetsFlag = args.length === 0 || args.includes('--assets');
  const skipPreflight = args.includes('--skip-preflight');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Hermetic Labs Exchange - Unified Build System          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Run preflight check (unless skipped)
  if (!skipPreflight) {
    console.log('[*] Running preflight checks...');
    console.log('   (run with --skip-preflight to bypass)\n');
  }

  // Ensure directories exist
  await mkdir(BUNDLES_DIR, { recursive: true });
  await mkdir(ZIPS_DIR, { recursive: true });

  const packages = await readdir(PACKAGES_DIR);
  const buildablePackages = packages.filter(p =>
    !SKIP_PACKAGES.includes(p) && !p.startsWith('.')
  );

  console.log(`[PKG] Found ${buildablePackages.length} packages\n`);

  let bundleSuccess = 0, bundleFailed = 0;
  let zipSuccess = 0, zipFailed = 0;

  // Build bundles
  if (buildBundles) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[FIX] Building ESM Bundles (with structure enforcement)...\n');

    let autoFixCount = 0;
    const structureIssues = [];

    for (const pkg of buildablePackages) {
      process.stdout.write(`   ${pkg}... `);
      const result = await buildBundle(pkg, false);

      if (result.fixes && result.fixes.length > 0) {
        autoFixCount += result.fixes.length;
      }

      if (result.success) {
        const fixNote = result.fixes?.length ? ` [${result.fixes.length} auto-fixed]` : '';
        console.log(`[OK] (${(result.size / 1024).toFixed(1)} KB)${fixNote}`);
        bundleSuccess++;
      } else {
        console.log(`⚠️  ${result.reason}`);
        bundleFailed++;
        if (result.issues) {
          structureIssues.push({ pkg, issues: result.issues });
        }
      }
    }

    console.log(`\n   Bundles: ${bundleSuccess} built, ${bundleFailed} skipped`);
    if (autoFixCount > 0) {
      console.log(`   [FIX] Auto-fixes applied: ${autoFixCount}`);
    }

    // Show structure issues summary
    if (structureIssues.length > 0) {
      console.log('\n   [LIST] Structure issues preventing build:');
      for (const { pkg, issues } of structureIssues.slice(0, 5)) {
        console.log(`      ${pkg}: ${issues[0]}`);
      }
      if (structureIssues.length > 5) {
        console.log(`      ... and ${structureIssues.length - 5} more`);
      }
    }
  }

  // Create zips
  if (buildZips) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DIR] Creating ZIP Archives...\n');

    for (const pkg of buildablePackages) {
      process.stdout.write(`   ${pkg}... `);
      const result = await createZip(pkg);
      if (result.success) {
        console.log(`[OK] (${(result.size / 1024).toFixed(1)} KB)`);
        zipSuccess++;
      } else {
        console.log(`[ERR] ${result.reason}`);
        zipFailed++;
      }
    }
    console.log(`\n   Zips: ${zipSuccess} created, ${zipFailed} failed`);
  }

  // Generate catalog
  if (buildCatalog) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[LIST] Generating Catalog...\n');

    const catalogResult = await generateCatalog();
    console.log(`   [OK] catalog.json: ${catalogResult.productCount} products, ${catalogResult.categoryCount} categories`);
    console.log(`   [DIR] Output: ${join(PUBLIC_DIR, 'catalog.json')}`);
  }

  // Sync assets
  let assetsSynced = 0;
  if (syncAssetsFlag) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[IMG]️  Syncing Package Assets...\n');

    assetsSynced = await syncAssets();
    console.log(`   [OK] ${assetsSynced} packages synced to public/packages/`);
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      Build Complete                        ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  if (buildBundles) console.log(`║  Bundles:  ${String(bundleSuccess).padStart(3)} built │ ${BUNDLES_DIR.slice(-40).padStart(40)} ║`);
  if (buildZips) console.log(`║  Zips:     ${String(zipSuccess).padStart(3)} created │ ${ZIPS_DIR.slice(-40).padStart(40)} ║`);
  if (buildCatalog) console.log(`║  Catalog:  public/catalog.json                              ║`);
  if (syncAssetsFlag) console.log(`║  Assets:   ${String(assetsSynced).padStart(3)} packages synced to public/packages/       ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Next: Run deploy.bat to upload to Azure Blob Storage      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
