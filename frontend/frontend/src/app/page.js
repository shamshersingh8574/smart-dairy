'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Calendar, Wallet, Users, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [pincode, setPincode] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPincode = async (e) => {
    e.preventDefault();
    if (!pincode) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/franchises/service-areas');
      const data = await res.json();
      
      if (data.success) {
        const area = data.data.find(a => a.pincode === pincode && a.status === 'active');
        if (area) {
          setStatusMsg({
            success: true,
            msg: `🟢 Good news! We deliver to ${area.areaName}. Serviced by ${area.franchise?.name || 'Main Warehouse'} with ₹${parseFloat(area.deliveryCharge).toFixed(2)} delivery fee.`
          });
        } else {
          setStatusMsg({
            success: false,
            msg: `🔴 Sorry! We don't service pincode ${pincode} yet. Try testing with "110001", "400001", or "560001".`
          });
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({
        success: false,
        msg: '⚠️ Could not connect to API server. Please make sure the backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.tagline}>pure organic dairy</span>
          <h1>Fresh Milk & Dairy Delivered Daily.</h1>
          <p>
            Experience premium farm-to-home quality. Sourced from organic farms, checked for zero adulteration, and delivered by 7:00 AM. Start a subscription or order one-time now!
          </p>
          <div className={styles.heroButtons}>
            <Link href="/products" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '15px' }}>
              Shop Fresh Products
            </Link>
            <Link href="/auth/register" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '15px' }}>
              Create Account (Get ₹100 Free)
            </Link>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <Award color="#ff9f1c" size={24} />
            <div>
              <h5 style={{ margin: 0, fontSize: '14px' }}>100% Pure</h5>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lab tested purity</span>
            </div>
          </div>
          
          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <Truck color="#1b4332" size={24} />
            <div>
              <h5 style={{ margin: 0, fontSize: '14px' }}>Before 7 AM</h5>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Guaranteed morning drop</span>
            </div>
          </div>

          <LeafGraphic />
        </div>
      </section>

      {/* Interactive Pincode Checker */}
      <section className={styles.pincodeChecker}>
        <h2>Check Delivery Availability</h2>
        <p style={{ maxWidth: '600px', opacity: 0.9 }}>
          Enter your local delivery area pincode below to check if our local franchise delivers fresh milk to your doorstep.
        </p>
        <form className={styles.pincodeForm} onSubmit={checkPincode}>
          <input
            type="text"
            className={styles.pincodeInput}
            placeholder="Enter Pincode (e.g. 110001, 560001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
          <button type="submit" className={styles.checkBtn} disabled={loading}>
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>
        {statusMsg && (
          <div style={{
            marginTop: '20px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '14px',
            borderLeft: `5px solid ${statusMsg.success ? 'var(--success)' : 'var(--error)'}`,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {statusMsg.msg}
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose GreenMeadow Dairy?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(27,67,50,0.1)' }}>
              <Calendar color="var(--primary)" size={24} />
            </div>
            <h3>Flexible Subscriptions</h3>
            <p>Subscribe for fresh milk to be dropped daily, on alternate days, or customize your weekday schedule. Pause or resume anytime.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(255,159,28,0.1)' }}>
              <Wallet color="var(--secondary)" size={24} />
            </div>
            <h3>Easy Wallet System</h3>
            <p>Pre-fund your digital wallet using mock UPI or cards. Daily subscription fees are automatically debited. Safe and contactless.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(46,196,182,0.1)' }}>
              <Truck color="var(--accent)" size={24} />
            </div>
            <h3>Franchise-Led Logistics</h3>
            <p>Our service area franchises keep fresh products in stock locally to ensure quick morning dispatch and optimized delivery routes.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Users color="var(--error)" size={24} />
            </div>
            <h3>Referral Rewards</h3>
            <p>Invite friends using your unique referral code. You get ₹50 credited directly to your wallet once they register. Share and save!</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Graphic design asset
function LeafGraphic() {
  return (
    <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
      <path d="M50 15C50 15 15 50 15 70C15 86.5685 28.4315 100 45 100C61.5685 100 75 86.5685 75 70C75 50 50 15 50 15Z" fill="white" />
      <path d="M50 15V100" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 45C58 49 68 47 68 47" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 60C58 64 68 62 68 62" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 75C58 79 68 77 68 77" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 45C42 49 32 47 32 47" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 60C42 64 32 62 32 62" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 75C42 79 32 77 32 77" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
