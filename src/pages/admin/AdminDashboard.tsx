// ============================================================
// HARVESTLINK - Admin Dashboard
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../context/DataStore';
import { StatCard, Section, Alert } from '../../components/ui';
import { formatINR, formatDate, formatRelativeTime, statusLabel } from '../../lib/utils';
import { Users, List, ClipboardList, Package, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO_RECENT_ACTIVITY } from '../../data/demoData';

export default function AdminDashboard() {
  const { profiles, listings, requirements, proposals, orders } = useDataStore();

  const farmers = profiles.filter(p => p.role === 'farmer');
  const buyers = profiles.filter(p => p.role === 'buyer');
  const activeListings = listings.filter(l => l.status === 'active');
  const activeReqs = requirements.filter(r => ['open', 'partially_matched'].includes(r.status));
  const matchedReqs = requirements.filter(r => r.status === 'matched');
  const pendingProposals = proposals.filter(p => ['pending_farmer_approval', 'partially_accepted'].includes(p.status));
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalCompletedValue = completedOrders.reduce((sum, o) => sum + o.finalTotal, 0);

  const chartData = [
    { name: 'Farmers', value: farmers.length },
    { name: 'Buyers', value: buyers.length },
    { name: 'Active\nListings', value: activeListings.length },
    { name: 'Open\nReqs', value: activeReqs.length },
    { name: 'Proposals', value: pendingProposals.length },
    { name: 'Completed\nOrders', value: completedOrders.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">HARVESTLINK marketplace overview — Demo Mode</p>
      </div>

      <Alert type="warning" message="Admin access is granted server-side only. In a production deployment, admin claims must be managed via Supabase service-role functions, not user-editable fields." className="mb-5" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Farmers" value={farmers.length} icon={<Users size={18} />} />
        <StatCard title="Total Buyers" value={buyers.length} icon={<Users size={18} />} />
        <StatCard title="Active Listings" value={activeListings.length} icon={<List size={18} />} />
        <StatCard title="Open Requirements" value={activeReqs.length} icon={<ClipboardList size={18} />} />
        <StatCard title="Matching Requirements" value={matchedReqs.length} icon={<TrendingUp size={18} />} />
        <StatCard title="Pending Proposals" value={pendingProposals.length} icon={<Package size={18} />} />
        <StatCard title="Completed Orders" value={completedOrders.length} icon={<CheckCircle2 size={18} />} />
        <StatCard title="Completed Order Value" value={formatINR(totalCompletedValue)} icon={<BarChart3 size={18} />}
          subtitle="Total product value — not platform revenue" />
      </div>

      {/* Chart */}
      <Section title="Marketplace Overview" className="mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Count']} />
              <Bar dataKey="value" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Quick Links */}
      <Section title="Management" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/users', label: 'Manage Users', count: profiles.length },
            { to: '/admin/listings', label: 'Review Listings', count: listings.length },
            { to: '/admin/prices', label: 'Manage Prices', count: 8 },
            { to: '/admin/orders', label: 'View All Orders', count: orders.length },
          ].map(l => (
            <Link key={l.to} to={l.to}>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                <p className="text-xl font-bold text-green-700">{l.count}</p>
                <p className="text-xs font-medium text-gray-700 mt-1">{l.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {DEMO_RECENT_ACTIVITY.map(act => (
            <div key={act.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">
                {act.type === 'listing_created' ? '🌱' : act.type === 'requirement_posted' ? '📋' :
                 act.type === 'proposal_sent' ? '📨' : act.type === 'farmer_accepted' ? '✅' : '🎉'}
              </div>
              <div>
                <p className="text-xs text-gray-700">{act.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(act.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
