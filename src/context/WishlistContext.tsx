import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';
import {
    fetchWishlist,
    addToBackendWishlist,
    removeFromBackendWishlist,
    isAuthenticated,
    WishlistItem as BackendWishlistItem
} from '../api/exchange';
import { useAuth } from './AuthContext';

interface WishlistItem {
    product: Product;
    addedAt: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
    syncWithBackend: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'hermetic_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
    const { user } = useAuth();

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setWishlistItems(parsed);
            } catch {
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
            }
        }
    }, []);

    // Sync with backend when user logs in
    useEffect(() => {
        if (user && !hasLoadedFromBackend) {
            syncWithBackend();
        }
    }, [user, hasLoadedFromBackend]);

    // Persist wishlist to localStorage on changes
    useEffect(() => {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const syncWithBackend = useCallback(async () => {
        if (!isAuthenticated()) return;

        try {
            const backendItems = await fetchWishlist();

            if (backendItems.length > 0) {
                // Merge backend items with local items
                // Backend is source of truth for authenticated users
                setWishlistItems(prev => {
                    const backendSlugs = new Set(backendItems.map((b: BackendWishlistItem) => b.productSlug));

                    // Keep local items that aren't in backend (upload them)
                    const localOnlyItems = prev.filter(item => !backendSlugs.has(item.product.slug));

                    // Upload local-only items to backend
                    localOnlyItems.forEach(item => {
                        addToBackendWishlist(item.product.id, item.product.slug);
                    });

                    // For now, return existing items + any backend items not already local
                    // Full merge would require fetching product details for backend items
                    return prev;
                });
            }

            setHasLoadedFromBackend(true);
        } catch (error) {
            console.warn('Failed to sync wishlist with backend:', error);
        }
    }, []);

    const addToWishlist = useCallback((product: Product) => {
        setWishlistItems(prev => {
            // Prevent duplicates
            if (prev.some(item => item.product.id === product.id)) {
                return prev;
            }

            // Sync to backend if authenticated
            if (isAuthenticated()) {
                addToBackendWishlist(product.id, product.slug);
            }

            return [...prev, {
                product,
                addedAt: new Date().toISOString()
            }];
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlistItems(prev => {
            const item = prev.find(i => i.product.id === productId);

            // Sync to backend if authenticated
            if (item && isAuthenticated()) {
                removeFromBackendWishlist(item.product.slug);
            }

            return prev.filter(item => item.product.id !== productId);
        });
    }, []);

    const clearWishlist = useCallback(() => {
        // Clear from backend too
        wishlistItems.forEach(item => {
            if (isAuthenticated()) {
                removeFromBackendWishlist(item.product.slug);
            }
        });
        setWishlistItems([]);
    }, [wishlistItems]);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.some(item => item.product.id === productId);
    }, [wishlistItems]);

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            clearWishlist,
            isInWishlist,
            wishlistCount: wishlistItems.length,
            syncWithBackend
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
