import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, Menu, X, LogOut, Library, Store, Filter, Settings, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { CATEGORY_COLORS } from '../types';

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';

export function Header() {
  const [showFilters, setShowFilters] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();

  // Refs for click-outside detection
  const filterRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentSort = (searchParams.get('sort') as SortOption) || 'popular';
  const freeOnly = searchParams.get('free') === 'true';
  const minRating = parseInt(searchParams.get('rating') || '0', 10);
  const activeCategory = searchParams.get('category');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleFreeToggle = () => {
    const params = new URLSearchParams(searchParams);
    if (freeOnly) {
      params.delete('free');
    } else {
      params.set('free', 'true');
    }
    setSearchParams(params);
  };

  const handleRatingChange = (rating: number) => {
    const params = new URLSearchParams(searchParams);
    if (rating === 0) {
      params.delete('rating');
    } else {
      params.set('rating', rating.toString());
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (category === null) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('sort');
    params.delete('free');
    params.delete('rating');
    params.delete('category');
    setSearchParams(params);
    setShowFilters(false);
  };

  const hasActiveFilters = activeCategory !== null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Categories from catalog
  const ALL_CATEGORIES = [
    'Healthcare',
    'Finance',
    'Government',
    'Legal',
    'Storage',
    'Developer Tools',
    'Productivity',
    'Media',
    'Entertainment',
    'Analytics',
    'Security',
    'Communications',
    'Education',
    'Research',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-cyber-green/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/Hermetci Labs Exchange Logo.png`}
              alt="Hermetic Labs Exchange"
              className="w-10 h-10 object-contain"
            />
          </Link>

          {/* Sign In / Profile - Next to Logo */}
          <div className="hidden md:block" ref={userMenuRef}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-cyber-green transition-colors rounded border border-white/10 hover:border-cyber-green/30"
              >
                <User className="w-4 h-4" />
                {user ? (
                  <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                ) : (
                  <span>Sign In</span>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full mt-2 left-0 cyber-panel p-2 min-w-[180px]">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-white/10 mb-1">
                        {user.email}
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-green hover:bg-white/5 rounded transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" /> Account Settings
                      </Link>
                      <Link
                        to="/library"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-green hover:bg-white/5 rounded transition-colors flex items-center gap-2"
                      >
                        <Library className="w-4 h-4" /> My Library
                      </Link>
                      <Link
                        to="/seller"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-cyan hover:bg-white/5 rounded transition-colors flex items-center gap-2"
                      >
                        <Store className="w-4 h-4" /> Seller Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-pink hover:bg-white/5 rounded transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-green hover:bg-white/5 rounded transition-colors block"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/auth?mode=register"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyber-green hover:bg-white/5 rounded transition-colors block"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="cyber-input w-full pl-4 pr-4"
                aria-label="Search"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-cyber-green transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-cyber-green rounded-full"></span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilters && (
                <div className="absolute top-full mt-2 right-0 cyber-panel p-4 min-w-[200px] max-h-[60vh] overflow-y-auto">
                  {/* Category Filter */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Category</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeCategory === null
                          ? 'bg-cyber-green/20 text-cyber-green'
                          : 'text-gray-300 hover:bg-white/5'
                          }`}
                      >
                        All Categories
                      </button>
                      {ALL_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeCategory === category
                            ? 'bg-cyber-green/20 text-cyber-green'
                            : 'text-gray-300 hover:bg-white/5'
                            }`}
                          style={{
                            color: activeCategory === category ? (CATEGORY_COLORS[category] || '#00ff99') : undefined,
                            backgroundColor: activeCategory === category ? `${CATEGORY_COLORS[category] || '#00ff99'}20` : undefined,
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeCategory && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-center text-sm text-cyber-pink hover:underline mt-4"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex items-center gap-1.5 text-sm text-gray-300 hover:text-cyber-pink transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-cyber-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart - Links to checkout, badge only shows when items present */}
            <Link to="/checkout" className="relative p-2 text-gray-300 hover:text-cyber-cyan transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-cyan text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-gray-300"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="cyber-input w-full pl-4 pr-4"
                  aria-label="Search"
                />
              </div>
            </form>
            <div className="space-y-2">
              {user ? (
                <>
                  <div className="py-2 text-sm text-gray-500">Signed in as {user.email}</div>
                  <Link to="/library" className="block py-2 text-gray-300 hover:text-cyber-green">
                    My Library
                  </Link>
                  <button onClick={logout} className="block py-2 text-gray-300 hover:text-cyber-pink">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block py-2 text-gray-300 hover:text-cyber-green">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
