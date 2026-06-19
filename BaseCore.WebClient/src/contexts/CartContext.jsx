import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.id === product.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity }];
        });
    };

    const removeFromCart = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) return removeFromCart(id);
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
