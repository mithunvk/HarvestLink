// ============================================================
// HARVESTLINK - Register Page
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../../types';

const BUSINESS_TYPES = [
  { value: 'retailer', label: 'Retailer / Shop' },
  { value: 'restaurant', label: 'Restaurant / Hotel' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'institution', label: 'Institution (School, Hospital, etc.)' },
  { value: 'processor', label: 'Food Processor' },
  { value: 'other', label: 'Other' },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'farmer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    village: '',
    taluk: '',
    district: '',
    businessType: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam === 'farmer' || roleParam === 'buyer') setRole(roleParam);
  }, [searchParams]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.displayName) newErrors.displayName = 'Name is required';
    if (role === 'farmer' && !formData.village) newErrors.village = 'Village is required for farmers';
    if (role === 'farmer' && !formData.taluk) newErrors.taluk = 'Taluk is required for farmers';
    if (role === 'buyer' && !formData.businessType) newErrors.businessType = 'Business type is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await register(formData.email, formData.password, role, formData.displayName);
    if (result.error) {
      setSubmitError(result.error);
    } else {
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard', { replace: true });
    }
  };

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-green-700 font-bold text-xl">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            HARVESTLINK
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mt-3">Create your account</h1>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(['farmer', 'buyer'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === r
                  ? 'bg-white shadow-sm text-green-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {r === 'farmer' ? '🌾 I\'m a Farmer' : '🛒 I\'m a Buyer'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {submitError && (
            <Alert type="error" message={submitError} className="mb-4" onDismiss={() => setSubmitError('')} />
          )}

          <Alert
            type="info"
            message="Admin accounts are not available through public registration."
            className="mb-4"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={role === 'farmer' ? 'Full Name' : 'Business / Organisation Name'}
              id="reg-name"
              value={formData.displayName}
              onChange={e => update('displayName', e.target.value)}
              required
              error={errors.displayName}
              placeholder={role === 'farmer' ? 'Your full name' : 'Mangalore Fresh Mart'}
            />

            <Input
              label="Email address"
              type="email"
              id="reg-email"
              value={formData.email}
              onChange={e => update('email', e.target.value)}
              required
              error={errors.email}
              placeholder="your@email.com"
            />

            <div className="space-y-1">
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(o => !o)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <Input
              label="Phone number"
              type="tel"
              id="reg-phone"
              value={formData.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="+91 98XXX XXXXX"
              hint="Optional — used only for demo contact display"
            />

            {role === 'farmer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Village"
                    id="reg-village"
                    value={formData.village}
                    onChange={e => update('village', e.target.value)}
                    required
                    error={errors.village}
                    placeholder="e.g., Niddodi"
                  />
                  <Input
                    label="Taluk"
                    id="reg-taluk"
                    value={formData.taluk}
                    onChange={e => update('taluk', e.target.value)}
                    required
                    error={errors.taluk}
                    placeholder="e.g., Puttur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={e => update('district', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select district</option>
                    <option value="Dakshina Kannada">Dakshina Kannada</option>
                    <option value="Udupi">Udupi</option>
                    <option value="Uttara Kannada">Uttara Kannada</option>
                  </select>
                </div>
              </>
            )}

            {role === 'buyer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={e => update('businessType', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.businessType ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map(bt => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="text-xs text-red-600 mt-1">{errors.businessType}</p>}
                </div>
                <Input
                  label="Delivery Location"
                  id="reg-location"
                  value={formData.village}
                  onChange={e => update('village', e.target.value)}
                  placeholder="e.g., Mangalore City, Udupi Town"
                  hint="Primary location for receiving produce"
                />
              </>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create {role === 'farmer' ? 'Farmer' : 'Buyer'} Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
