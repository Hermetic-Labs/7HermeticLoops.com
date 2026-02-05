import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { fetchProducts, fetchCategories } from '../api/exchange';
import { Product, Category, Domain, ALL_DOMAINS, DOMAIN_LABELS } from '../types';
import { Zap, Clock, Loader2 } from 'lucide-react';

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';

// Announcement type for carousel
interface Announcement {
  id: string;
  mediaType: 'video' | 'image';
  src: string;
  title?: string;
  tagline?: string;
}

export function HomePage() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  // Read filter state from URL (set by Header filter dropdown)
  const currentSort = (searchParams.get('sort') as SortOption) || 'popular';
  const freeOnly = searchParams.get('free') === 'true';
  const minRating = parseInt(searchParams.get('rating') || '0', 10);

  const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter);
  const [activeDomain, setActiveDomain] = useState<Domain | null>(
    searchParams.get('domain') as Domain | null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);

        // Load announcements from Videos/manifest.json
        try {
          const manifestRes = await fetch(`${import.meta.env.BASE_URL}Videos/manifest.json`);
          if (manifestRes.ok) {
            const manifest = await manifestRes.json();
            setAnnouncements(manifest.announcements || []);
          }
        } catch (err) {
          console.log('No announcements loaded:', err);
        }
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync activeCategory and activeDomain with URL
  useEffect(() => {
    setActiveCategory(categoryFilter);
    setActiveDomain(searchParams.get('domain') as Domain | null);
  }, [categoryFilter, searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter (legacy)
    if (activeCategory) {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Domain filter (new taxonomy)
    if (activeDomain) {
      filtered = filtered.filter((p) =>
        p.domain === activeDomain || p.domains?.includes(activeDomain)
      );
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
      );
    }

    // Price filter (free only from URL)
    if (freeOnly) {
      filtered = filtered.filter((p) => p.price === 0);
    }

    // Rating filter from URL
    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    // Sorting from URL
    switch (currentSort) {
      case 'newest':
        filtered = [...filtered].sort((a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) =>
          (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
        );
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) =>
          (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)
        );
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [products, activeCategory, activeDomain, searchQuery, currentSort, freeOnly, minRating]);

  // Products for the filtered domain carousel (when viewing a specific domain)
  const domainProducts = useMemo(() => {
    if (!activeDomain) return [];
    return products
      .filter((p) => p.domain === activeDomain || p.domains?.includes(activeDomain))
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }, [products, activeDomain]);

  const featuredProducts = useMemo(() => products.filter((p) => p.featured), [products]);
  const newProducts = useMemo(() => products.filter((p) => p.isNew), [products]);
  const popularProducts = useMemo(
    () => [...products].sort((a, b) => b.reviewCount - a.reviewCount),
    [products]
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Exchange...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-cyber-pink mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="cyber-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we're viewing a filtered domain page
  const isViewingDomain = !!activeDomain && !searchQuery;

  return (
    <div className="min-h-screen pt-20">
      {/* Title and Hero Carousel - Main Page View */}
      {!activeCategory && !activeDomain && !searchQuery && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-cyber-green text-glow-green text-center mb-8">
              Hermetic Labs Exchange
            </h1>
            <HeroCarousel products={popularProducts} announcements={announcements} />
          </div>
        </section>
      )}

      {/* Domain-Specific View - When clicking into a domain */}
      {/* Shows the same carousel pattern but only for that domain */}
      {isViewingDomain && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-cyber-green text-glow-green">
                {DOMAIN_LABELS[activeDomain]}
              </h1>
              <Link to="/" className="text-cyber-pink text-sm hover:underline">
                ← Back to All
              </Link>
            </div>
            {/* Domain-specific carousel with only products from this domain */}
            <HeroCarousel products={domainProducts} announcements={[]} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!activeCategory && !activeDomain && !searchQuery && featuredProducts.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="section-title flex items-center gap-2">
                <Zap className="w-4 h-4" /> Featured
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Releases */}
      {!activeCategory && !activeDomain && !searchQuery && newProducts.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-b from-transparent via-cyber-green/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2">
                <Clock className="w-4 h-4" /> New Releases
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular / Filtered Results - Always shown at bottom */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">
              {activeCategory || activeDomain || searchQuery
                ? `Results ${searchQuery ? `for "${searchQuery}"` : activeDomain ? `in ${DOMAIN_LABELS[activeDomain]}` : `in ${activeCategory}`}`
                : 'Popular Modules'}
            </h2>
            {(activeCategory || activeDomain) && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setActiveDomain(null);
                }}
                className="text-cyber-pink text-sm hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Products Grid - Filterable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeCategory || activeDomain || searchQuery ? filteredProducts : popularProducts).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (activeCategory || activeDomain || searchQuery) && (
            <div className="text-center py-12 text-gray-500">No products found</div>
          )}
        </div>
      </section>
    </div>
  );
}
