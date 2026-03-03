"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item } from '@/types';

export interface CartItem extends Item {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Item) => void;
    removeFromCart: (id: number) => void;
    removeAllFromCart: (id: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (item: Item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: number) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id);
            if (item && item.quantity > 1) {
                return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const removeAllFromCart = (id: number) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => setCart([]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cart.reduce((sum, item) => {
         const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
         // Handle inconsistent price types if any
         return sum + (Number(price) * item.quantity);
    }, 0);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, removeAllFromCart, clearCart, cartTotal, cartCount, isCartOpen, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
