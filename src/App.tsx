// ============================================================
// HARVESTLINK - Application Root with Routing
// ============================================================

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataStoreProvider } from './context/DataStore';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageLoader } from './components/ui';

// ── Public Pages ──────────────────────────────────────────────
import HomePage from './pages/public/HomePage';
const MarketplacePage = lazy(() => import('./pages/public/MarketplacePage'));
const PricesPage = lazy(() => import('./pages/public/PricesPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));

// ── Auth Pages ────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// ── Farmer Pages ──────────────────────────────────────────────
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const FarmerListingsPage = lazy(() => import('./pages/farmer/FarmerListingsPage'));
const ListingFormPage = lazy(() => import('./pages/farmer/ListingFormPage'));
const FarmerDemandPage = lazy(() => import('./pages/farmer/FarmerDemandPage'));
const FarmerOrdersPage = lazy(() => import('./pages/farmer/FarmerOrdersPage'));
const FarmerProfilePage = lazy(() => import('./pages/farmer/FarmerProfilePage'));

// ── Buyer Pages ───────────────────────────────────────────────
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const BuyerRequirementsPage = lazy(() => import('./pages/buyer/BuyerRequirementsPage'));
const RequirementFormPage = lazy(() => import('./pages/buyer/RequirementFormPage'));
const MatchesPage = lazy(() => import('./pages/buyer/MatchesPage'));
const BuyerOrdersPage = lazy(() => import('./pages/buyer/BuyerOrdersPage'));

// ── Admin Pages (named exports via .then) ─────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminPages').then(m => ({ default: m.AdminUsersPage }))
);
const AdminListingsPage = lazy(() =>
  import('./pages/admin/AdminPages').then(m => ({ default: m.AdminListingsPage }))
);
const AdminPricesPage = lazy(() =>
  import('./pages/admin/AdminPages').then(m => ({ default: m.AdminPricesPage }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminPages').then(m => ({ default: m.AdminOrdersPage }))
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataStoreProvider>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/prices" element={<PricesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Farmer */}
                <Route path="/farmer/dashboard" element={
                  <ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>
                } />
                <Route path="/farmer/listings" element={
                  <ProtectedRoute requiredRole="farmer"><FarmerListingsPage /></ProtectedRoute>
                } />
                <Route path="/farmer/listings/new" element={
                  <ProtectedRoute requiredRole="farmer"><ListingFormPage /></ProtectedRoute>
                } />
                <Route path="/farmer/listings/:id/edit" element={
                  <ProtectedRoute requiredRole="farmer"><ListingFormPage /></ProtectedRoute>
                } />
                <Route path="/farmer/demand" element={
                  <ProtectedRoute requiredRole="farmer"><FarmerDemandPage /></ProtectedRoute>
                } />
                <Route path="/farmer/orders" element={
                  <ProtectedRoute requiredRole="farmer"><FarmerOrdersPage /></ProtectedRoute>
                } />
                <Route path="/farmer/profile" element={
                  <ProtectedRoute requiredRole="farmer"><FarmerProfilePage /></ProtectedRoute>
                } />

                {/* Buyer */}
                <Route path="/buyer/dashboard" element={
                  <ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>
                } />
                <Route path="/buyer/requirements" element={
                  <ProtectedRoute requiredRole="buyer"><BuyerRequirementsPage /></ProtectedRoute>
                } />
                <Route path="/buyer/requirements/new" element={
                  <ProtectedRoute requiredRole="buyer"><RequirementFormPage /></ProtectedRoute>
                } />
                <Route path="/buyer/matches/:requirementId" element={
                  <ProtectedRoute requiredRole="buyer"><MatchesPage /></ProtectedRoute>
                } />
                <Route path="/buyer/orders" element={
                  <ProtectedRoute requiredRole="buyer"><BuyerOrdersPage /></ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>
                } />
                <Route path="/admin/listings" element={
                  <ProtectedRoute requiredRole="admin"><AdminListingsPage /></ProtectedRoute>
                } />
                <Route path="/admin/prices" element={
                  <ProtectedRoute requiredRole="admin"><AdminPricesPage /></ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute requiredRole="admin"><AdminOrdersPage /></ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </DataStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🌾</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-800">
        Go to Home
      </a>
    </div>
  );
}

export default App;
