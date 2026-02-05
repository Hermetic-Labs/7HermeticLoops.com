import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';

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
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'hermetic_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

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

    // Persist wishlist to localStorage on changes
    useEffect(() => {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = useCallback((product: Product) => {
        setWishlistItems(prev => {
            // Prevent duplicates
            if (prev.some(item => item.product.id === product.id)) {
                return prev;
            }
            return [...prev, {
                product,
                addedAt: new Date().toISOString()
            }];
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const clearWishlist = useCallback(() => {
        setWishlistItems([]);
    }, []);

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
            wishlistCount: wishlistItems.length
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
