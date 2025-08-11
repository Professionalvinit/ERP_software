'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/';
      return;
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Database seeded successfully! Check the console for details.');
        console.log('Seed result:', result);
      } else {
        alert('Failed to seed database: ' + result.error);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error seeding database. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon"></div>
              <h1>ErpFlow</h1>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div>
      {/* Stats Grid */}
      <div className="erp-stats-grid">
        <div className="erp-stat-card">
          <div className="erp-stat-content">
            <div className="erp-stat-info">
              <p className="erp-stat-label">Total Revenue</p>
              <p className="erp-stat-value">$124,563</p>
            </div>
            <div className="erp-stat-change positive">+12.5%</div>
          </div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-content">
            <div className="erp-stat-info">
              <p className="erp-stat-label">Active Customers</p>
              <p className="erp-stat-value">1,234</p>
            </div>
            <div className="erp-stat-change positive">+5.2%</div>
          </div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-content">
            <div className="erp-stat-info">
              <p className="erp-stat-label">Pending Invoices</p>
              <p className="erp-stat-value">23</p>
            </div>
            <div className="erp-stat-change negative">-8.1%</div>
          </div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-content">
            <div className="erp-stat-info">
              <p className="erp-stat-label">Products Sold</p>
              <p className="erp-stat-value">456</p>
            </div>
            <div className="erp-stat-change positive">+15.3%</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="erp-content-grid">
        <div className="erp-card">
          <div className="erp-card-header">
            <h3>Recent Invoices</h3>
          </div>
          <div className="erp-card-content">
            <div className="erp-invoice-list">
              <div className="erp-invoice-item">
                <div className="erp-invoice-info">
                  <p className="erp-invoice-id">INV-001</p>
                  <p className="erp-invoice-customer">Acme Corp</p>
                </div>
                <div className="erp-invoice-details">
                  <p className="erp-invoice-amount">$2,500</p>
                  <span className="erp-status paid">Paid</span>
                </div>
              </div>
              <div className="erp-invoice-item">
                <div className="erp-invoice-info">
                  <p className="erp-invoice-id">INV-002</p>
                  <p className="erp-invoice-customer">TechStart Inc</p>
                </div>
                <div className="erp-invoice-details">
                  <p className="erp-invoice-amount">$1,800</p>
                  <span className="erp-status pending">Pending</span>
                </div>
              </div>
              <div className="erp-invoice-item">
                <div className="erp-invoice-info">
                  <p className="erp-invoice-id">INV-003</p>
                  <p className="erp-invoice-customer">Global Solutions</p>
                </div>
                <div className="erp-invoice-details">
                  <p className="erp-invoice-amount">$3,200</p>
                  <span className="erp-status overdue">Overdue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="erp-card">
          <div className="erp-card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="erp-card-content">
            <div className="erp-actions">
              <button className="erp-action-btn" onClick={seedDatabase}>
                <div className="erp-action-title">🌱 Seed Database</div>
                <div className="erp-action-desc">Populate with sample data for testing</div>
              </button>
              <button className="erp-action-btn">
                <div className="erp-action-title">Create Invoice</div>
                <div className="erp-action-desc">Generate a new invoice for a customer</div>
              </button>
              <button className="erp-action-btn">
                <div className="erp-action-title">Add Customer</div>
                <div className="erp-action-desc">Register a new customer</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'customers':
        return (
          <div className="erp-card">
            <div className="erp-card-header">
              <h3>Customer Management</h3>
            </div>
            <div className="erp-card-content">
              <p>Customer management features will be implemented here.</p>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="erp-card">
            <div className="erp-card-header">
              <h3>Product Inventory</h3>
            </div>
            <div className="erp-card-content">
              <p>Product inventory features will be implemented here.</p>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="erp-card">
            <div className="erp-card-header">
              <h3>Invoice Management</h3>
            </div>
            <div className="erp-card-content">
              <p>Invoice management features will be implemented here.</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="erp-card">
            <div className="erp-card-header">
              <h3>Reports & Analytics</h3>
            </div>
            <div className="erp-card-content">
              <p>Reports and analytics will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="erp-container">
      {/* Header */}
      <header className="erp-header">
        <div className="erp-header-content">
          <div className="erp-logo">
            <div className="erp-logo-icon"></div>
            <h1>ErpFlow</h1>
          </div>
          <div className="erp-user-info">
            <span>Welcome, {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="login-btn login-btn-primary" style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="erp-layout">
        {/* Sidebar */}
        <nav className="erp-sidebar">
          <div className="erp-nav-items">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'customers', label: 'Customers', icon: '👥' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'invoices', label: 'Invoices', icon: '📄' },
              { id: 'reports', label: 'Reports', icon: '📈' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`erp-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <span className="erp-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="erp-main">
          <div className="erp-page-header">
            <h2 className="capitalize">{activeTab}</h2>
            <p>Manage your business operations efficiently</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
