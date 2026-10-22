// ============================================================
// HARVESTLINK - App Layout with Navigation
// ============================================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DemoModeBanner } from '../ui';
import { cn } from '../../lib/utils';
import {
  Leaf,
  LayoutDashboard,
  List,
  TrendingUp,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Package,
  ClipboardList,
  BarChart3,
  Home,
  Store,
  HelpCircle,
  Bell,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'farmer':
      return [
        { href: '/farmer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { href: '/farmer/listings', label: 'My Listings', icon: <List size={18} /> },
        { href: '/farmer/demand', label: 'Demand Radar', icon: <TrendingUp size={18} /> },
        { href: '/farmer/orders', label: 'Orders', icon: <Package size={18} /> },
        { href: '/farmer/profile', label: 'Profile', icon: <Settings size={18} /> },
      ];
    case 'buyer':
      return [
        { href: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { href: '/buyer/requirements', label: 'Requirements', icon: <ClipboardList size={18} /> },
        { href: '/marketplace', label: 'Marketplace', icon: <Store size={18} /> },
        { href: '/buyer/orders', label: 'Orders', icon: <Package size={18} /> },
      ];
    case 'admin':
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
        { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
        { href: '/admin/listings', label: 'Listings', icon: <List size={18} /> },
        { href: '/admin/prices', label: 'Prices', icon: <TrendingUp size={18} /> },
        { href: '/admin/orders', label: 'Orders', icon: <Package size={18} /> },
      ];
    default:
      return [];
  }
}

const publicNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home size={18} /> },
  { href: '/marketplace', label: 'Marketplace', icon: <Store size={18} /> },
  { href: '/prices', label: 'Prices', icon: <TrendingUp size={18} /> },
  { href: '/how-it-works', label: 'How It Works', icon: <HelpCircle size={18} /> },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = user ? getNavItems(user.role) : publicNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {isDemoMode && <DemoModeBanner />}

      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-green-700 font-bold text-lg"
              aria-label="HARVESTLINK Home"
            >
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="hidden sm:block">HARVESTLINK</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {!user && publicNavItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {user && navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName.slice(0, 1)}
                    </div>
                    <span className="hidden sm:block text-gray-700 font-medium max-w-[120px] truncate">
                      {user.displayName}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-900 truncate">{user.displayName}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        {user.role === 'farmer' && (
                          <Link
                            to="/farmer/profile"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings size={14} /> Profile Settings
                          </Link>
                        )}
                        <Link
                          to="/marketplace"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Store size={14} /> Marketplace
                        </Link>
                        <Link
                          to="/prices"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <TrendingUp size={14} /> Price References
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-green-700 text-white px-4 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {!user && (
                <>
                  <hr className="my-2 border-gray-100" />
                  <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center gap-3 px-3 py-2.5 text-sm bg-green-700 text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
              {user && (
                <>
                  <hr className="my-2 border-gray-100" />
                  <Link to="/marketplace" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Store size={18} /> Marketplace
                  </Link>
                  <Link to="/prices" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <TrendingUp size={18} /> Price References
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 page-enter">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-green-700">
              <Leaf size={16} />
              <span className="font-bold text-sm">HARVESTLINK</span>
              <span className="text-gray-400 text-xs">— Better markets. Fairer harvests.</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Serving Dakshina Kannada & Udupi, Karnataka</span>
              <span>·</span>
              <Link to="/how-it-works" className="hover:text-green-700">How It Works</Link>
              <span>·</span>
              <Link to="/prices" className="hover:text-green-700">Price References</Link>
            </div>
          </div>
          {isDemoMode && (
            <p className="text-center text-xs text-amber-700 mt-3 bg-amber-50 rounded-lg py-1.5">
              🔬 Demo Mode — All data is for demonstration only. Not real market data.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
