'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Sparkles, Calendar, ShoppingCart, RefreshCw, Layers } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function ProductsPage() {
  const { token, user } = useAuth();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [selectedVariants, setSelectedVariants] = useState({}); // productId -> active variant index
  const [subscribePanel, setSubscribePanel] = useState(null); // variantId or null (holds subscription form data)
  
  // Subscription parameters
  const [subQty, setSubQty] = useState(1);
  const [subFreq, setSubFreq] = useState('daily');
  const [subDays, setSubDays] = useState('Monday,Wednesday,Friday');
  const [subStartDate, setSubStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const catRes = await fetch(`${API_BASE}/products/categories`);
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data);
      }

      // Fetch products
      const prodRes = await fetch(`${API_BASE}/products`);
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.data);
        
        // Initialize default variants (first variant is active)
        const defaults = {};
        prodData.data.forEach(p => {
          if (p.variants && p.variants.length > 0) {
            defaults[p.id] = p.variants[0];
          }
        });
        setSelectedVariants(defaults);
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Backend server not responding. Please verify it is running.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddToCart = async (variantId) => {
    setMsg(null);
    try {
      await addToCart(variantId, 1);
      setMsg({ type: 'success', text: '🟢 Item successfully added to your cart!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleCreateSubscription = async (e, variantId) => {
    e.preventDefault();
    if (!user) {
      setMsg({ type: 'error', text: 'Please log in to subscribe to dairy products.' });
      return;
    }
    if (user.addresses?.length === 0) {
      setMsg({ type: 'error', text: 'Please register a delivery address in your Dashboard first.' });
      return;
    }

    setMsg(null);
    try {
      const addressId = user.addresses[0].id; // use default address
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          variantId,
          addressId,
          quantity: subQty,
          frequency: subFreq,
          customDays: subFreq === 'custom' ? subDays : null,
          startDate: subStartDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: '🎉 Subscription created successfully! Billed automatically from your Wallet.' });
        setSubscribePanel(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Organic Dairy Catalog</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Select pure farm-fresh goods. Set up daily subscriptions or check out a single batch.
        </p>
      </div>

      {msg && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-sm)',
          background: msg.type === 'success' ? '#e6fffa' : '#fff5f5',
          color: msg.type === 'success' ? '#047481' : 'var(--error)',
          fontWeight: 700,
          fontSize: '14px',
          borderLeft: `5px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
          marginBottom: '30px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {msg.text}
        </div>
      )}

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '40px'
      }}>
        <button
          className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedCategory(null)}
          style={{ borderRadius: '9999px', padding: '8px 20px' }}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{ borderRadius: '9999px', padding: '8px 20px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <RefreshCw className="animate-spin" size={36} color="var(--primary)" style={{ margin: '0 auto 16px', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading fresh dairy inventory...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          {filteredProducts.map(prod => {
            const activeVariant = selectedVariants[prod.id];
            
            return (
              <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      {prod.category?.name}
                    </span>
                    <h3 style={{ fontSize: '20px', marginTop: '4px' }}>{prod.name}</h3>
                  </div>
                  {activeVariant?.discountPrice && (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} />
                      Save
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineAlign: '1.5', flex: 1 }}>
                  {prod.description}
                </p>

                {/* Variant Toggles */}
                {prod.variants && prod.variants.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Size/Volume</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {prod.variants.map(v => (
                        <button
                          key={v.id}
                          className={`btn ${activeVariant?.id === v.id ? 'btn-primary' : 'btn-outline'}`}
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [prod.id]: v })}
                        >
                          {v.volumeWeight}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Block */}
                {activeVariant && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '5px' }}>
                    {activeVariant.discountPrice ? (
                      <>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{parseFloat(activeVariant.discountPrice).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                          ₹{parseFloat(activeVariant.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{parseFloat(activeVariant.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {activeVariant && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {subscribePanel === activeVariant.id ? (
                      // Interactive Subscription Setup Form
                      <form
                        onSubmit={(e) => handleCreateSubscription(e, activeVariant.id)}
                        className="animate-fade-in"
                        style={{
                          background: 'var(--background)',
                          padding: '16px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <h4 style={{ fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} color="var(--primary)" />
                          Configure Schedule
                        </h4>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '11px' }}>Qty (Per Delivery)</label>
                          <input
                            type="number"
                            className="form-input"
                            min={1}
                            value={subQty}
                            onChange={(e) => setSubQty(parseInt(e.target.value))}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '11px' }}>Frequency</label>
                          <select
                            className="form-input"
                            value={subFreq}
                            onChange={(e) => setSubFreq(e.target.value)}
                          >
                            <option value="daily">Daily Delivery</option>
                            <option value="alternate">Alternate Days</option>
                            <option value="custom">Custom Days</option>
                          </select>
                        </div>

                        {subFreq === 'custom' && (
                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '11px' }}>Custom Days (comma separated)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={subDays}
                              onChange={(e) => setSubDays(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '11px' }}>Start Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={subStartDate}
                            onChange={(e) => setSubStartDate(e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ flex: 1, padding: '10px' }}
                            onClick={() => setSubscribePanel(null)}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                            Confirm Sub
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn btn-outline"
                          style={{ flex: 1 }}
                          onClick={() => handleAddToCart(activeVariant.id)}
                          title="Add One-time purchase to Cart"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setSubscribePanel(activeVariant.id);
                            setSubQty(1);
                          }}
                        >
                          <Calendar size={16} />
                          Subscribe
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
