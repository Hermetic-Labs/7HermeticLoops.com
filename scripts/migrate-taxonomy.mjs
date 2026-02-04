#!/usr/bin/env node
/**
 * Migrate existing package manifests to new taxonomy system
 *
 * This script adds the new class, domain, and relationships fields
 * to existing package manifests while preserving legacy fields.
 *
 * Usage:
 *   node scripts/migrate-taxonomy.mjs --dry-run    Preview changes
 *   node scripts/migrate-taxonomy.mjs              Apply changes
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = join(__dirname, '..', 'packages');

// Skip these directories
const SKIP_PACKAGES = ['_shared', '_template', 'node_modules'];

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

// Tag to domain mapping for fallback
const TAG_TO_DOMAIN = {
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

/**
 * Migrate a single package manifest
 */
async function migratePackage(packageDir, dryRun) {
  const manifestPath = join(packageDir, 'manifest.json');
  if (!existsSync(manifestPath)) return null;

  let content;
  try {
    content = await readFile(manifestPath, 'utf-8');
  } catch (err) {
    return { name: packageDir, status: 'error', error: err.message };
  }

  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch (err) {
    return { name: packageDir, status: 'invalid-json', error: err.message };
  }

  // Skip if already fully migrated
  if (manifest.class && manifest.domain && manifest.domains) {
    return { name: manifest.name || packageDir, status: 'already-migrated' };
  }

  const changes = [];

  // Infer class from type
  if (!manifest.class && manifest.type) {
    manifest.class = TYPE_TO_CLASS[manifest.type.toLowerCase()] || 'Module';
    changes.push(`class: ${manifest.class} (from type: ${manifest.type})`);
  } else if (!manifest.class) {
    manifest.class = 'Module';
    changes.push(`class: Module (default)`);
  }

  // Infer domain from category
  if (!manifest.domain && manifest.category) {
    manifest.domain = CATEGORY_TO_DOMAIN[manifest.category] || 'dev';
    changes.push(`domain: ${manifest.domain} (from category: ${manifest.category})`);
  } else if (!manifest.domain) {
    // Try from tags
    let foundDomain = null;
    if (manifest.tags && manifest.tags.length > 0) {
      for (const tag of manifest.tags) {
        const tagLower = tag.toLowerCase();
        if (TAG_TO_DOMAIN[tagLower]) {
          foundDomain = TAG_TO_DOMAIN[tagLower];
          break;
        }
      }
    }
    manifest.domain = foundDomain || 'dev';
    changes.push(`domain: ${manifest.domain} (from tags or default)`);
  }

  // Ensure domains array
  if (!manifest.domains) {
    manifest.domains = [manifest.domain];
    changes.push(`domains: [${manifest.domain}]`);
  }

  // Build relationships from existing fields
  if (!manifest.relationships) {
    const relationships = {};
    let hasRelationships = false;

    // Check integrations for extends
    if (manifest.integrations && manifest.integrations.length > 0) {
      relationships.extends = manifest.integrations;
      hasRelationships = true;
      changes.push(`relationships.extends: ${manifest.integrations.join(', ')}`);
    }

    // Check dependencies.packages for requires
    if (manifest.dependencies?.packages?.length > 0) {
      relationships.requires = manifest.dependencies.packages;
      hasRelationships = true;
      changes.push(`relationships.requires: ${manifest.dependencies.packages.join(', ')}`);
    }

    // Check remix.original for remixedFrom
    if (manifest.remix?.original) {
      relationships.remixedFrom = manifest.remix.original;
      manifest.class = 'Remix';  // Override class
      hasRelationships = true;
      changes.push(`relationships.remixedFrom: ${manifest.remix.original}`);
      changes.push(`class: Remix (from remix.original)`);
    }

    if (hasRelationships) {
      manifest.relationships = relationships;
    }
  }

  if (changes.length === 0) {
    return { name: manifest.name, status: 'no-changes' };
  }

  if (!dryRun) {
    await writeFile(manifestPath, JSON.stringify(manifest, null, 4));
  }

  return {
    name: manifest.name || packageDir,
    status: dryRun ? 'would-update' : 'updated',
    changes
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  HERMETIC LABS TAXONOMY MIGRATION`);
  console.log(`  ${dryRun ? '[DRY RUN] Preview mode - no changes will be made' : 'Applying changes to package manifests'}`);
  console.log(`${'='.repeat(60)}\n`);

  const packages = await readdir(PACKAGES_DIR);
  const results = [];

  for (const pkg of packages) {
    // Skip non-directories and special folders
    if (SKIP_PACKAGES.includes(pkg) || pkg.startsWith('.') || pkg.endsWith('.ts') || pkg.endsWith('.json') || pkg.endsWith('.toml')) {
      continue;
    }

    const pkgPath = join(PACKAGES_DIR, pkg);
    const result = await migratePackage(pkgPath, dryRun);
    if (result) results.push(result);
  }

  // Categorize results
  const updated = results.filter(r => r.status === 'updated' || r.status === 'would-update');
  const alreadyMigrated = results.filter(r => r.status === 'already-migrated');
  const noChanges = results.filter(r => r.status === 'no-changes');
  const errors = results.filter(r => r.status === 'error' || r.status === 'invalid-json');

  // Print detailed updates
  if (updated.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`  ${dryRun ? 'WOULD UPDATE' : 'UPDATED'} (${updated.length} packages)`);
    console.log(`${'─'.repeat(40)}`);
    for (const r of updated) {
      console.log(`\n  ${r.name}:`);
      r.changes.forEach(c => console.log(`    + ${c}`));
    }
  }

  // Print errors if any
  if (errors.length > 0) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`  ERRORS (${errors.length} packages)`);
    console.log(`${'─'.repeat(40)}`);
    for (const r of errors) {
      console.log(`  ${r.name}: ${r.error}`);
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  ${updated.length} packages ${dryRun ? 'would be' : ''} updated`);
  console.log(`  ${alreadyMigrated.length} packages already migrated`);
  console.log(`  ${noChanges.length} packages with no changes needed`);
  if (errors.length > 0) console.log(`  ${errors.length} packages with errors`);
  console.log(`  ${results.length} total packages processed`);

  if (dryRun && updated.length > 0) {
    console.log(`\n  Run without --dry-run to apply changes.`);
  }

  console.log('');
}

main().catch(console.error);
