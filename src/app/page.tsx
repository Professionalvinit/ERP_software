'use client';

import { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store auth data and redirect
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@demo.com');
    setPassword('demo123456');
    
    // Auto-submit after setting values
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon"></div>
            <h1>ErpFlow</h1>
          </div>
          <p className="login-subtitle">Business Management System</p>
        </div>

        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div className="login-error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-btn login-btn-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="login-btn login-btn-demo"
            >
              🚀 Try Demo Login (admin@demo.com)
            </button>
          </form>

          <div className="login-footer">
            💡 Having trouble? Open browser console (F12) to see detailed error logs
          </div>
        </div>
      </div>
    </div>
  );
}
