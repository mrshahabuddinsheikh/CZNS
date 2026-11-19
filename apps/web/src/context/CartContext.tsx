'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../lib/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  removeFromCart: (variant_id: string) => void;
  updateQuantity: (variant_id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  phoneMode: 'all' | 'new' | 'used';
  setPhoneMode: (mode: 'all' | 'new' | 'used') => void;
  storeCoins: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [phoneMode, setPhoneMode] = useState<'all' | 'new' | 'used'>('all');
  const [storeCoins, setStoreCoins] = useState(1250); // Default welcome coins

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('czns_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedCoins = localStorage.getItem('czns_coins');
      if (savedCoins) {
        setStoreCoins(parseInt(savedCoins, 10));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('czns_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (item: CartItem, openDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variant_id === item.variant_id);
      if (existing) {
        return prev.map((i) =>
          i.variant_id === item.variant_id
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.max_stock) }
            : i
        );
      }
      return [...prev, item];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (variant_id: string) => {
    setCart((prev) => prev.filter((i) => i.variant_id !== variant_id));
  };

  const updateQuantity = (variant_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variant_id);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.variant_id === variant_id
          ? { ...i, quantity: Math.min(quantity, i.max_stock) }
          : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        phoneMode,
        setPhoneMode,
        storeCoins,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
