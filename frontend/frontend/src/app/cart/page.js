'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Trash2, CreditCard, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CartPage() {
  const { user, token, refreshProfile, addAddress } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, checkout } = useCart();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [deliverySlot, setDeliverySlot] = useState('6:00 AM - 9:00 AM');
  
  // Quick address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      // Set first address as default selection
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(def.id);
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const newAddr = await addAddress({
        street,
        city,
        state,
        postalCode,
        isDefault: true
      });
      setSelectedAddress(newAddr.id);
      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add address');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setErrorMsg('Please select a delivery address first.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await checkout({
        addressId: selectedAddress,
        paymentMethod,
        deliverySlot
      });
      // Redirect to orders tab on dashboard
      router.push('/dashboard?checkout=success');
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '24px' }}>Please Log In</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          You need an account to view and manage your shopping cart.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/auth/login')}>
          Go to Login Page
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '40px' }}>Your Shopping Cart</h1>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff5f5',
          color: 'var(--error)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          fontWeight: 700,
          borderLeft: '5px solid var(--error)',
          marginBottom: '30px'
        }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }} className="card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '20px' }}>
            Your shopping cart is currently empty.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/products')}>
            Shop Dairy Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' }}>
          
          {/* Cart List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map(item => {
              const variant = item.variant;
              const price = variant.discountPrice ? parseFloat(variant.discountPrice) : parseFloat(variant.price);
              
              return (
                <div key={item.id} className="card" style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr auto',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{variant.product?.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      Volume/Size: {variant.volumeWeight}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '15px' }}>
                    ₹{price.toFixed(2)}
                  </div>

                  {/* Quantity Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Checkout Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Order Summary
            </h3>

            {/* Address Selection */}
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                1. Delivery Address
              </h4>

              {user.addresses && user.addresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    className="form-input"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  >
                    {user.addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.city} ({addr.postalCode})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px', alignSelf: 'flex-end' }}
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    No saved addresses found.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    onClick={() => setShowAddressForm(true)}
                  >
                    Create Address
                  </button>
                </div>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} style={{
                  marginTop: '15px',
                  background: 'var(--background)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Street Address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pincode (e.g. 110001, 560001)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '8px' }}
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Delivery Slot selection */}
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                2. Morning Delivery Slot
              </h4>
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              >
                <option value="6:00 AM - 9:00 AM">6:00 AM - 9:00 AM (Recommended for Fresh Milk)</option>
                <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                <option value="5:00 PM - 8:00 PM">5:00 PM - 8:00 PM</option>
              </select>
            </div>

            {/* Payment Method selection */}
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} />
                3. Choose Payment Method
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'var(--background)',
                  border: `1px solid ${paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <div>
                    <span style={{ fontWeight: 700 }}>Debit Wallet Balance</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Available: ₹{parseFloat(user.wallet?.balance || 0).toFixed(2)}
                    </span>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'var(--background)',
                  border: `1px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div>
                    <span style={{ fontWeight: 700 }}>Cash on Delivery (COD)</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Pay at delivery time
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{
              background: 'var(--background)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '16px',
                borderTop: '1px solid var(--border)',
                paddingTop: '10px',
                color: 'var(--primary)'
              }}>
                <span>Total Amount</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              disabled={submitting}
              onClick={handleCheckout}
            >
              {submitting ? 'Processing Payment...' : `Complete Checkout • ₹${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
