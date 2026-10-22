// ============================================================
// HARVESTLINK - Login Page
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../../data/demoData';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      // Navigate based on role
      const profile = DEMO_CREDENTIALS.find(c => c.email === email);
      if (profile?.role === 'farmer') navigate('/farmer/dashboard', { replace: true });
      else if (profile?.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (profile?.role === 'buyer') navigate('/buyer/dashboard', { replace: true });
      else navigate(from === '/login' ? '/' : from, { replace: true });
    }
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-green-700 font-bold text-xl">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            HARVESTLINK
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mt-3">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Better markets. Fairer harvests.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && (
            <Alert type="error" message={error} className="mb-4" onDismiss={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              id="login-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />

            <div className="space-y-1">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(o => !o)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
            🔬 Demo Credentials — Local Development Only
          </p>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.slice(0, 5).map(cred => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillDemo(cred.email, cred.password)}
                className="w-full flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-gray-800">{cred.name}</p>
                  <p className="text-gray-500">{cred.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  cred.role === 'farmer' ? 'bg-green-100 text-green-700' :
                  cred.role === 'buyer' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {cred.role}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2">Password for all: <strong>demo1234</strong></p>
        </div>
      </div>
    </div>
  );
}
