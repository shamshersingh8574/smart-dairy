'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  Calendar,
  Layers,
  Wrench,
  Users,
  Settings,
  RefreshCw,
  Edit,
  MapPin,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function ConsolePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Selected tab
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Admin states
  const [tickets, setTickets] = useState([]);
  const [simDate, setSimDate] = useState(new Date().toISOString().split('T')[0]);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Franchise states
  const [inventory, setInventory] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null); // variantId
  const [newStockVal, setNewStockVal] = useState('');
  
  // Pincode setup states
  const [pincode, setPincode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');

  const fetchConsoleData = async () => {
    if (!token) return;
    setLoading(true);
    setMsg(null);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      if (user.role === 'admin') {
        // Fetch all tickets
        const tRes = await fetch(`${API_BASE}/support/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tData = await tRes.json();
        if (tData.success) setTickets(tData.data);
      } else if (user.role === 'franchise') {
        // Fetch inventory
        const invRes = await fetch(`${API_BASE}/franchises/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const invData = await invRes.json();
        if (invData.success) setInventory(invData.data);
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error connecting to analytics. Check backend server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsoleData();
  }, [token, activeTab]);

  // Admin resolves ticket
  const resolveTicket = async (ticketId) => {
    try {
      const res = await fetch(`${API_BASE}/support/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Ticket resolved successfully.' });
        fetchConsoleData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  // Admin triggers subscription deliveries simulation
  const runDeliveriesSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch(`${API_BASE}/subscriptions/trigger-daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetDate: simDate })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult({
          success: true,
          date: simDate,
          processed: data.data.subscriptionsChecked,
          deliveries: data.data.deliveriesCreated,
          errors: data.data.errorsFound || 0
        });
        fetchConsoleData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setSimResult({ success: false, msg: err.message });
    } finally {
      setSimLoading(false);
    }
  };

  // Franchise updates stock
  const handleUpdateStock = async (e, variantId) => {
    e.preventDefault();
    if (!newStockVal || parseInt(newStockVal) < 0) return;
    try {
      const res = await fetch(`${API_BASE}/franchises/inventory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ variantId, stockCount: parseInt(newStockVal) })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Inventory updated successfully.' });
        setEditingVariant(null);
        setNewStockVal('');
        fetchConsoleData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  // Franchise adds service area pincode
  const handleAddArea = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/franchises/service-areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pincode,
          areaName,
          deliveryCharge: parseFloat(deliveryCharge) || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Service area registered successfully.' });
        setPincode('');
        setAreaName('');
        setDeliveryCharge('');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'franchise')) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          This console is reserved for admin and franchise users only.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', minHeight: '75vh' }}>
      
      {/* Sidebar Nav */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px' }}>{user.role === 'admin' ? 'System Admin' : 'Franchise Console'}</h3>
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-secondary)' }}>{user.name}</span>
        </div>

        <button
          className="btn"
          style={{
            justifyContent: 'flex-start',
            background: activeTab === 'overview' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
            border: 'none',
            padding: '12px 18px',
            textAlign: 'left'
          }}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={18} />
          <span>Dashboard Overview</span>
        </button>

        {user.role === 'admin' && (
          <>
            <button
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'tickets' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '12px 18px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTab('tickets')}
            >
              <Wrench size={18} />
              <span>Support Tickets</span>
            </button>

            <button
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'simulate' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'simulate' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '12px 18px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTab('simulate')}
            >
              <Settings size={18} />
              <span>Simulate Engine</span>
            </button>
          </>
        )}

        {user.role === 'franchise' && (
          <>
            <button
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'inventory' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '12px 18px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTab('inventory')}
            >
              <Layers size={18} />
              <span>Manage Inventory</span>
            </button>

            <button
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: activeTab === 'service-areas' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'service-areas' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '12px 18px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTab('service-areas')}
            >
              <MapPin size={18} />
              <span>Register Service Areas</span>
            </button>
          </>
        )}
      </aside>

      {/* Main Content */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {msg && (
          <div style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            background: msg.type === 'success' ? '#e6fffa' : '#fff5f5',
            color: msg.type === 'success' ? '#047481' : 'var(--error)',
            fontWeight: 700,
            fontSize: '13px',
            borderLeft: `5px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {msg.text}
          </div>
        )}

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && stats && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>Analytics & Key Metrics</h2>
              <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={fetchConsoleData}>
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Stat Counters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {user.role === 'admin' ? (
                <>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>TOTAL REVENUE</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>₹{parseFloat(stats.revenue || 0).toFixed(2)}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE SUBSCRIPTIONS</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{stats.activeSubscriptions}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>WALLETS CASH RESERVE</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>₹{parseFloat(stats.walletReserve || 0).toFixed(2)}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>OPEN SUPPORT TICKETS</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--error)' }}>{stats.openTickets}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>TOTAL SALES HANDLED</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>₹{parseFloat(stats.sales || 0).toFixed(2)}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>ORDERS MATCHED</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{stats.ordersCount}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>COMMISSION EARNINGS</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary)' }}>₹{parseFloat(stats.earnings || 0).toFixed(2)}</span>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>LOW STOCK WARNINGS</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--error)' }}>{stats.lowStockWarnings}</span>
                  </div>
                </>
              )}
            </div>

            {/* Franchise Commissions ledger (Admin Only) */}
            {user.role === 'admin' && stats.franchiseStats && (
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Franchise Commission Log Ledger</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Franchise Name</th>
                        <th>Comm. Rate</th>
                        <th>Total Orders</th>
                        <th>Total Revenue Processed</th>
                        <th>Total Earnings Credited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.franchiseStats.map(f => (
                        <tr key={f.id}>
                          <td style={{ fontWeight: 700 }}>{f.name}</td>
                          <td>{f.commissionRate}%</td>
                          <td>{f.ordersCount} orders</td>
                          <td>₹{parseFloat(f.totalSales).toFixed(2)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(f.earnings).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Support Ticket Queue (Admin Only) */}
        {activeTab === 'tickets' && user.role === 'admin' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '24px' }}>Customer Support Resolution Center</h2>
            {tickets.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No tickets opened in the system.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tickets.map(t => (
                  <div key={t.id} className="card" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '16px' }}>{t.subject}</h4>
                        <span className={`badge ${t.status === 'open' ? 'badge-danger' : 'badge-success'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{t.description}</p>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '8px' }}>
                        Priority: <b>{t.priority.toUpperCase()}</b> • User ID: {t.userId} • Opened: {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {t.status === 'open' && (
                      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => resolveTicket(t.id)}>
                        <Check size={14} />
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Simulate Engine (Admin Only) */}
        {activeTab === 'simulate' && user.role === 'admin' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '24px' }}>Cron Subscription Delivery Simulator</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Because there is no active background cron loop running on local development, you can use this admin utility to simulate time forwarding. Select a calendar date to trigger daily subscription billing, stock checking, and delivery assignments.
            </p>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Target Delivery Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                />
              </div>

              <button className="btn btn-secondary" onClick={runDeliveriesSimulation} disabled={simLoading}>
                {simLoading ? 'Running Simulation...' : 'Trigger Daily Deliveries Engine'}
              </button>
            </div>

            {simResult && (
              <div className="card" style={{
                borderLeft: `5px solid ${simResult.success ? 'var(--success)' : 'var(--error)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Simulation Results</h4>
                {simResult.success ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>📅 <b>Target Date:</b> {simResult.date}</div>
                    <div>🔄 <b>Subscriptions Evaluated:</b> {simResult.processed}</div>
                    <div>🚚 <b>Deliveries Successfully Generated:</b> {simResult.deliveries}</div>
                    <div>⚠️ <b>Failed Billing Runs:</b> {simResult.errors}</div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--error)', fontSize: '13px' }}>Simulation failed: {simResult.msg}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Manage Inventory (Franchise Only) */}
        {activeTab === 'inventory' && user.role === 'franchise' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '24px' }}>Franchise Stock Inventory Ledger</h2>
            {inventory.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No catalog items registered for this franchise.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size/Variant</th>
                      <th>Current Stock</th>
                      <th>Low Threshold</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.variant?.product?.name}</td>
                        <td>{item.variant?.volumeWeight}</td>
                        <td>
                          {editingVariant === item.variantId ? (
                            <form onSubmit={(e) => handleUpdateStock(e, item.variantId)} style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: '80px', padding: '6px' }}
                                value={newStockVal}
                                onChange={(e) => setNewStockVal(e.target.value)}
                                min={0}
                                required
                              />
                              <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                Save
                              </button>
                              <button type="button" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setEditingVariant(null)}>
                                X
                              </button>
                            </form>
                          ) : (
                            <span style={{
                              fontWeight: 'bold',
                              color: item.stockCount <= item.lowStockThreshold ? 'var(--error)' : 'var(--text-primary)'
                            }}>
                              {item.stockCount} units
                            </span>
                          )}
                        </td>
                        <td>{item.lowStockThreshold} units</td>
                        <td>
                          {editingVariant !== item.variantId && (
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => {
                                setEditingVariant(item.variantId);
                                setNewStockVal(item.stockCount.toString());
                              }}
                            >
                              <Edit size={12} />
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Register Service Area (Franchise Only) */}
        {activeTab === 'service-areas' && user.role === 'franchise' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Register New Pincode</h3>
              <form onSubmit={handleAddArea}>
                <div className="form-group">
                  <label>Pincode (6 digits)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Service Area Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Indiranagar Central"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Base Delivery Charge (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 30"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    min={0}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Register Pincode Area
                </button>
              </form>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Service Area Rules</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                Once you register a pincode as a franchise owner:
                <br /><br />
                1. Any customer checking out with a matching shipping address pincode will automatically have their order routed to your franchise warehouse.
                <br /><br />
                2. You will be credited the delivery fee and the commission rate (e.g. 10%) on order items once marked delivered!
                <br /><br />
                3. Check your overview dashboard to track incoming commissions!
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
