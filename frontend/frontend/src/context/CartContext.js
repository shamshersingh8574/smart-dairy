'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API_BASE = 'http://localhost:5000/api/v1';

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (variantId, quantity = 1) => {
    if (!token) {
      throw new Error('Please log in to add products to your cart.');
    }
    const res = await fetch(`${API_BASE}/orders/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ variantId, quantity })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    await fetchCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/orders/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/orders/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    await fetchCart();
  };

  const checkout = async ({ addressId, paymentMethod, deliverySlot }) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/orders/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ addressId, paymentMethod, deliverySlot })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    setCartItems([]); // Clear local state
    return data.data;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.variant.discountPrice ? parseFloat(item.variant.discountPrice) : parseFloat(item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, checkout, fetchCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
