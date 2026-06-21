'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { ShoppingBag, Wallet, LogOut, User, Leaf, ShieldAlert } from 'lucide-react';
import styles from '../app/layout.module.css';

function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/">
        <div className={styles.logoContainer}>
          <Leaf size={28} color="#1b4332" fill="#d8f3dc" />
          <span className={styles.logoText}>GreenMeadow</span>
        </div>
      </Link>

      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>
          Home
        </Link>
        <Link href="/products" className={`${styles.navLink} ${pathname.startsWith('/products') ? styles.navLinkActive : ''}`}>
          Products
        </Link>
        {user && user.role === 'customer' && (
          <Link href="/dashboard" className={`${styles.navLink} ${pathname.startsWith('/dashboard') ? styles.navLinkActive : ''}`}>
            My Dashboard
          </Link>
        )}
        {user && (user.role === 'admin' || user.role === 'franchise') && (
          <Link href="/admin/analytics" className={`${styles.navLink} ${pathname.startsWith('/admin') ? styles.navLinkActive : ''}`}>
            Console
          </Link>
        )}
      </nav>

      <div className={styles.actions}>
        {user && user.role === 'customer' && (
          <>
            <Link href="/dashboard?tab=wallet">
              <div className={styles.walletBadge}>
                <Wallet size={16} />
                <span>₹{parseFloat(user.wallet?.balance || 0).toFixed(2)}</span>
              </div>
            </Link>

            <Link href="/cart">
              <button className={styles.cartButton}>
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </button>
            </Link>
          </>
        )}

        {user ? (
          <div className={styles.userMenu}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className={styles.userName}>{user.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'capitalize' }}>({user.role})</span>
            </div>
            <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={logout} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/auth/login" className="btn btn-outline" style={{ padding: '8px 16px' }}>
              Log In
            </Link>
            <Link href="/auth/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Leaf size={24} color="#ff9f1c" />
                <h4 style={{ margin: 0 }}>GreenMeadow Dairy</h4>
              </div>
              <p>Fresh organic cow milk and curated premium farm products delivered to your doorstep every morning.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Products</h4>
              <ul>
                <Link href="/products"><li>Fresh Milk</li></Link>
                <Link href="/products"><li>Paneer & Cheese</li></Link>
                <Link href="/products"><li>Pure Cow Ghee</li></Link>
                <Link href="/products"><li>Salted Butter</li></Link>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Modules Covered</h4>
              <ul>
                <li>Auth & Address</li>
                <li>Categories & Variants</li>
                <li>Subscriptions & Cart</li>
                <li>Wallet & Franchise</li>
                <li>Support & Delivery</li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <p>📍 Sector 4, Metro City</p>
              <p>📞 +91 98765 43210</p>
              <p>📧 support@greenmeadow.com</p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>&copy; {new Date().getFullYear()} GreenMeadow Dairy Farm. All rights reserved.</span>
            <span>Proper MVC with Service Setup</span>
          </div>
        </footer>
      </CartProvider>
    </AuthProvider>
  );
}
