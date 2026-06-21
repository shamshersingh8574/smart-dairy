'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('dairy_token');
    const storedUser = localStorage.getItem('dairy_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Refresh profile in background
      getFreshProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const getFreshProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        localStorage.setItem('dairy_user', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error('Failed to sync profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    localStorage.setItem('dairy_token', data.token);
    localStorage.setItem('dairy_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    // Fetch full profile immediately
    await getFreshProfile(data.token);

    if (data.user.role === 'admin') {
      router.push('/admin/analytics');
    } else if (data.user.role === 'franchise') {
      router.push('/admin/analytics');
    } else {
      router.push('/dashboard');
    }

    return data.user;
  };

  const register = async ({ name, email, password, phone, role, referredByCode }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role, referredByCode })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    localStorage.setItem('dairy_token', data.token);
    localStorage.setItem('dairy_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    await getFreshProfile(data.token);
    router.push('/dashboard');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('dairy_token');
    localStorage.removeItem('dairy_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const addAddress = async (addressData) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    await getFreshProfile(token);
    return data.data;
  };

  const rechargeWallet = async (amount, method) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/wallet/recharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    await getFreshProfile(token);
    return data.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, addAddress, rechargeWallet, refreshProfile: () => getFreshProfile(token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
