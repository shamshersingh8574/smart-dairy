'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Wallet,
  ShoppingBag,
  MessageSquare,
  User,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

function DashboardContent() {
  const { user, token, refreshProfile, addAddress, rechargeWallet } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active tab state
  const defaultTab = searchParams.get('tab') || 'subscriptions';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Data lists
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  
  // Form states
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [ticketSub, setTicketSub] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('low');
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch page data based on selected tab
  const fetchTabData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'subscriptions') {
        const res = await fetch(`${API_BASE}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setSubscriptions(data.data);
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_BASE}/orders/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } else if (activeTab === 'tickets') {
        const res = await fetch(`${API_BASE}/support`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setTickets(data.data);
      } else if (activeTab === 'wallet') {
        const res = await fetch(`${API_BASE}/wallet/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setWalletHistory(data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
    if (searchParams.get('checkout') === 'success') {
      setSuccessMsg('🎉 Thank you! Your checkout succeeded. Your fresh delivery has been scheduled.');
    }
  }, [activeTab, token]);

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!rechargeAmt || parseFloat(rechargeAmt) <= 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await rechargeWallet(rechargeAmt, 'mock_card');
      setSuccessMsg(`🟢 Success! Wallet recharged with ₹${parseFloat(rechargeAmt).toFixed(2)}.`);
      setRechargeAmt('');
      // Refresh balance & history
      refreshProfile();
      const res = await fetch(`${API_BASE}/wallet/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setWalletHistory(data.data);
    } catch (err) {
      setErrorMsg(err.message || 'Recharge failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSub,
          description: ticketDesc,
          priority: ticketPriority
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('🟢 Support ticket created successfully. Our team will review it.');
        setTicketSub('');
        setTicketDesc('');
        setTicketPriority('low');
        
        // Refresh list
        const listRes = await fetch(`${API_BASE}/support`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (listData.success) setTickets(listData.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await addAddress({ street, city, state, postalCode });
      setSuccessMsg('🟢 Address added successfully.');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      refreshProfile();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubStatus = async (subId, currentStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`${API_BASE}/subscriptions/${subId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`🟢 Subscription updated to ${newStatus}.`);
        
        // Refresh subscriptions list
        const listRes = await fetch(`${API_BASE}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (listData.success) setSubscriptions(listData.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px' }}>Please Log In</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          You need to be logged in to view your dashboard settings.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/auth/login')}>
          Go to Login Page
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', minHeight: '75vh' }}>
      
      {/* Sidebar Tabs */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px' }}>Welcome,</h3>
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-secondary)' }}>{user.name}</span>
        </div>

        {[
          { id: 'subscriptions', label: 'My Subscriptions', icon: Calendar },
          { id: 'wallet', label: 'My Wallet', icon: Wallet },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
          { id: 'profile', label: 'Profile & Addresses', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '12px 18px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main Panel Content */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {successMsg && (
          <div style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            background: '#e6fffa',
            color: '#047481',
            fontWeight: 700,
            fontSize: '13px',
            borderLeft: '5px solid var(--success)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            background: '#fff5f5',
            color: 'var(--error)',
            fontWeight: 700,
            fontSize: '13px',
            borderLeft: '5px solid var(--error)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>Recurring Dairy Deliveries</h2>
              <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={fetchTabData}>
                <RefreshCw size={14} />
              </button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  No active milk or product subscriptions found.
                </p>
                <button className="btn btn-primary" onClick={() => router.push('/products')}>
                  Browse Products & Subscribe
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {subscriptions.map(sub => (
                  <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '16px' }}>{sub.variant?.product?.name}</h4>
                      <span className={`badge ${sub.status === 'active' ? 'badge-success' : 'badge-pending'}`}>
                        {sub.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div><b>Size:</b> {sub.variant?.volumeWeight}</div>
                      <div><b>Qty:</b> {sub.quantity} units</div>
                      <div><b>Frequency:</b> {sub.frequency} {sub.customDays ? `(${sub.customDays})` : ''}</div>
                      <div><b>Next Delivery:</b> {sub.nextDeliveryDate}</div>
                    </div>

                    <button
                      className="btn btn-outline"
                      style={{ marginTop: '5px', fontSize: '12px', padding: '8px' }}
                      onClick={() => handleToggleSubStatus(sub.id, sub.status)}
                    >
                      {sub.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wallet */}
        {activeTab === 'wallet' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h2 style={{ fontSize: '24px' }}>My Digital Wallet</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Wallet recharge card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Current Balance</span>
                <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{parseFloat(user.wallet?.balance || 0).toFixed(2)}
                </div>

                <form onSubmit={handleRecharge} style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div className="form-group">
                    <label>Fund Wallet (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter amount (e.g. 500)"
                      value={rechargeAmt}
                      onChange={(e) => setRechargeAmt(e.target.value)}
                      min={10}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                    Add Funds (Simulated Card)
                  </button>
                </form>
              </div>

              {/* Referral Bonus promo card */}
              <div className="card" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', color: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Ticket color="var(--secondary)" size={32} />
                <h3 style={{ color: 'var(--secondary)', fontSize: '20px' }}>Refer & Earn ₹50</h3>
                <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: 1.5 }}>
                  Share your referral code with friends. When they sign up, you get ₹50 added to your wallet automatically!
                </p>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Your Code:</span>
                  <span style={{ fontWeight: 800, letterSpacing: '1px' }}>{user.referralCode}</span>
                </div>
              </div>
            </div>

            {/* Wallet Transaction logs */}
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Transaction History</h3>
              {walletHistory.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No transactions recorded yet.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletHistory.map(txn => (
                        <tr key={txn.id}>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              color: txn.transactionType === 'credit' ? 'var(--success)' : 'var(--error)'
                            }}>
                              {txn.transactionType.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            {txn.transactionType === 'credit' ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{txn.description}</td>
                          <td style={{ color: 'var(--text-light)', fontFamily: 'monospace' }}>{txn.referenceId?.substring(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px' }}>Order History</h2>
              <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={fetchTabData}>
                <RefreshCw size={14} />
              </button>
            </div>

            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map(order => (
                  <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Order ID: #{order.id.substring(0, 8)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>
                          Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                          Type: {order.orderType}
                        </span>
                        <span className="badge badge-pending" style={{ textTransform: 'uppercase' }}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items inside order */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>
                            {item.variant?.product?.name} ({item.variant?.volumeWeight}) x {item.quantity}
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                      marginTop: '5px'
                    }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Payment: <b>{order.payment?.paymentMethod?.toUpperCase()}</b> ({order.payment?.status})
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary)' }}>
                        Total Paid: ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                    </div>

                    {/* Delivery tracking */}
                    {order.delivery && (
                      <div style={{
                        background: 'var(--background)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>
                          Status: <b>{order.delivery.status.toUpperCase()}</b>
                        </span>
                        {order.delivery.status !== 'delivered' && (
                          <span style={{ background: 'var(--primary)', color: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            Delivery OTP: {order.delivery.otp}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Tickets */}
        {activeTab === 'tickets' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Create ticket form */}
            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Raise Support Ticket</h3>
              <form onSubmit={handleCreateTicket}>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Milk got spoiled / Delayed delivery"
                    value={ticketSub}
                    onChange={(e) => setTicketSub(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Provide details about your query..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Priority</label>
                  <select
                    className="form-input"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* List tickets */}
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Ticket Backlog</h3>
              {tickets.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No active tickets opened.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {tickets.map(t => (
                    <div key={t.id} className="card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '15px' }}>{t.subject}</h4>
                        <span className={`badge ${t.status === 'open' ? 'badge-danger' : 'badge-success'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {t.description}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '10px', display: 'flex', justify: 'space-between' }}>
                        <span>Priority: <span style={{ fontWeight: 'bold' }}>{t.priority.toUpperCase()}</span></span>
                        <span>Opened: {new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Profile & Address */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Address list */}
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Saved Delivery Locations</h3>
              {user.addresses && user.addresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.addresses.map(addr => (
                    <div key={addr.id} className="card" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {addr.addressType} Location {addr.isDefault && '★ Default'}
                      </span>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '5px' }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No saved delivery locations.</p>
              )}
            </div>

            {/* Address add form */}
            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Register New Location</h3>
              <form onSubmit={handleAddAddress}>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123 Block C, Sector 12"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Metro City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Postal/Pin Code (Checks Franchise servicing)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="110001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  Add Address Location
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Dashboard() {
  return (
    <React.Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard panel...</p>
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
