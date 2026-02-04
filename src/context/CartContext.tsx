import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';

interface CartItem {
  product: Product;
  addedAt: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hermetic_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCartItems(parsed);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Persist cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
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

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price;
  }, 0);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product.id === productId);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
