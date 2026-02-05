// ============================================
// Package Taxonomy Types
// ============================================

export type PackageClass = 'Core' | 'Module' | 'Connector' | 'Component' | 'Remix';

export type Domain =
  | 'health'
  | 'compliance'
  | 'enterprise'
  | 'finance'
  | 'gov'
  | 'infra'
  | 'creative'
  | 'dev'
  | 'social'
  | 'edu'
  | 'research'
  | 'legal';

export interface PackageRelationships {
  extends?: string[];      // Packages this extends
  requires?: string[];     // Required dependencies
  enhances?: string[];     // Optional integrations
  remixedFrom?: string;    // Original package if remix
}

// Class badge colors (cyber theme)
export const CLASS_COLORS: Record<PackageClass, string> = {
  Core: '#00ff99',      // cyber-green
  Module: '#00b4ff',    // cyber-cyan
  Connector: '#ff64c8', // cyber-pink
  Component: '#a855f7', // purple
  Remix: '#f59e0b',     // amber/orange
};

// Class badge background colors - solid dark backgrounds with color tint
// Higher opacity for better visibility on varied image backgrounds
export const CLASS_BG_COLORS: Record<PackageClass, string> = {
  Core: 'rgba(0, 40, 25, 0.9)',      // Dark green-black
  Module: 'rgba(0, 30, 50, 0.9)',    // Dark blue-black
  Connector: 'rgba(50, 15, 35, 0.9)', // Dark pink-black
  Component: 'rgba(30, 15, 50, 0.9)', // Dark purple-black
  Remix: 'rgba(50, 30, 5, 0.9)',     // Dark amber-black
};

// Domain display labels
export const DOMAIN_LABELS: Record<Domain, string> = {
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

// Domain badge colors (cyber theme - each domain has unique color)
export const DOMAIN_COLORS: Record<Domain, string> = {
  health: '#ff6b6b',      // coral red
  compliance: '#ffd93d',  // gold
  enterprise: '#6bcb77',  // green
  finance: '#4d96ff',     // blue
  gov: '#9d4edd',         // purple
  infra: '#ff8c42',       // orange
  creative: '#ff64c8',    // pink
  dev: '#00ff99',         // cyber-green
  social: '#00b4ff',      // cyber-cyan
  edu: '#a78bfa',         // violet
  research: '#2dd4bf',    // teal
  legal: '#94a3b8',       // slate
};

// Domain badge background colors
export const DOMAIN_BG_COLORS: Record<Domain, string> = {
  health: 'rgba(255, 107, 107, 0.15)',
  compliance: 'rgba(255, 217, 61, 0.15)',
  enterprise: 'rgba(107, 203, 119, 0.15)',
  finance: 'rgba(77, 150, 255, 0.15)',
  gov: 'rgba(157, 78, 221, 0.15)',
  infra: 'rgba(255, 140, 66, 0.15)',
  creative: 'rgba(255, 100, 200, 0.15)',
  dev: 'rgba(0, 255, 153, 0.15)',
  social: 'rgba(0, 180, 255, 0.15)',
  edu: 'rgba(167, 139, 250, 0.15)',
  research: 'rgba(45, 212, 191, 0.15)',
  legal: 'rgba(148, 163, 184, 0.15)',
};

// Category badge colors (for product.category field)
export const CATEGORY_COLORS: Record<string, string> = {
  'Storage': '#4d96ff',           // blue
  'Entertainment': '#ff64c8',     // pink
  'Healthcare': '#ff6b6b',        // coral red
  'Healthcare ai': '#ff6b6b',     // coral red
  'Medical': '#ff6b6b',           // coral red
  'Developer Tools': '#00ff99',   // cyber-green
  'Government': '#9d4edd',        // purple
  'Defense': '#9d4edd',           // purple
  'Productivity': '#6bcb77',      // green
  'Analytics': '#2dd4bf',         // teal
  'Business': '#6bcb77',          // green
  'Connectivity': '#ff8c42',      // orange
  'Legal': '#94a3b8',             // slate
  'Payments': '#ffd93d',          // gold
  'Financial': '#4d96ff',         // blue
  'Finance': '#4d96ff',           // blue
  'CRM': '#a78bfa',               // violet
  'ERP': '#a78bfa',               // violet
  'Media': '#ff64c8',             // pink
  'Accessibility': '#00b4ff',     // cyan
  'VR/XR': '#ff64c8',             // pink
};

// All domains in display order
export const ALL_DOMAINS: Domain[] = [
  'health',
  'compliance',
  'enterprise',
  'finance',
  'gov',
  'infra',
  'creative',
  'dev',
  'social',
  'edu',
  'research',
  'legal',
];

// All classes in display order
export const ALL_CLASSES: PackageClass[] = [
  'Core',
  'Module',
  'Connector',
  'Component',
  'Remix',
];

// ============================================
// Author & Product Types
// ============================================

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  productCount: number;
  totalSales: number;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface TechSpec {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  user: string;
  question: string;
  answer?: string;
  date: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface DocumentationSummary {
  overview: string;
  exampleUseCase: string;
  whatMakesThisDifferent: string;
}

export interface DocumentationCard {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ProductDocumentation {
  card?: DocumentationCard;
  summary?: DocumentationSummary;
  readme?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stripePriceId?: string;
  author: Author;
  category: string;                    // Legacy - use domain instead
  media: MediaItem[];
  description: string;
  techSpecs: TechSpec[];
  links: { label: string; url: string }[];
  questions: Question[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  releaseDate: string;
  featured?: boolean;
  isNew?: boolean;
  downloadUrl?: string;
  documentation?: ProductDocumentation;

  // New Taxonomy Fields
  class?: PackageClass;                // Package classification
  domain?: Domain;                     // Primary domain
  domains?: Domain[];                  // All domains (including primary)
  relationships?: PackageRelationships; // Package relationships
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}
