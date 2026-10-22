// ============================================================
// HARVESTLINK - Farmer Dashboard
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { StatCard, Section, Button, Card, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, formatRelativeTime } from '../../lib/utils';
import { Plus, List, TrendingUp, Package, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { DEMO_RECENT_ACTIVITY } from '../../data/demoData';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { listings, getListingsByFarmer, getProposalItemsByFarmer, getOrdersByUser } = useDataStore();

  if (!user) return null;

  const myListings = getListingsByFarmer(user.id);
  const myProposalItems = getProposalItemsByFarmer(user.id);
  const myOrders = getOrdersByUser(user.id, 'farmer');

  const activeListings = myListings.filter(l => l.status === 'active');
  const pendingProposals = myProposalItems.filter(pi => pi.item.acceptanceStatus === 'pending');
  const activeOrders = myOrders.filter(o => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const totalEarned = completedOrders.reduce((sum, o) => {
    const myItems = o.items.filter(i => i.farmerId === user.id);
    return sum + myItems.reduce((s, i) => s + i.lineTotal, 0);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user.displayName.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Farmer Dashboard · {user.village}, {user.taluk}</p>
        </div>
        <Link to="/farmer/listings/new">
          <Button leftIcon={<Plus size={15} />}>List Produce</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Listings" value={activeListings.length} icon={<List size={18} />}
          subtitle={`${myListings.filter(l => l.status === 'paused').length} paused`} />
        <StatCard title="Pending Proposals" value={pendingProposals.length} icon={<TrendingUp size={18} />}
          subtitle="Awaiting your response" />
        <StatCard title="Active Orders" value={activeOrders.length} icon={<Package size={18} />}
          subtitle="In progress" />
        <StatCard title="Total Earned" value={formatINR(totalEarned)} icon={<CheckCircle2 size={18} />}
          subtitle={`${completedOrders.length} completed orders`} />
      </div>

      {/* Quick Actions */}
      <Section title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/farmer/listings/new', label: 'List New Produce', icon: <Plus size={18} />, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { to: '/farmer/listings', label: 'Manage Listings', icon: <List size={18} />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { to: '/farmer/demand', label: 'View Demand Radar', icon: <TrendingUp size={18} />, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { to: '/farmer/orders', label: 'View Orders', icon: <Package size={18} />, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 transition-colors cursor-pointer ${a.color}`}>
                {a.icon}
                <span className="text-xs font-medium text-center leading-tight">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Active Listings */}
        <Section title="My Active Listings" actions={<Link to="/farmer/listings" className="text-xs text-green-700 hover:underline">View all</Link>}>
          {activeListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-gray-500 text-sm">No active listings.</p>
              <Link to="/farmer/listings/new"><Button size="sm" className="mt-3">Add First Listing</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeListings.slice(0, 3).map(l => (
                <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{l.productName}</p>
                    <p className="text-xs text-gray-500">{l.quantityAvailable} {l.unit} available · {formatINR(l.askingPricePerUnit)}/{l.unit}</p>
                    <p className="text-xs text-gray-400">Until {l.availableUntil ? formatDate(l.availableUntil) : 'ongoing'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={l.status} />
                    <Link to={`/farmer/listings/${l.id}/edit`} className="text-xs text-green-700 hover:underline">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Pending Proposals */}
        <Section title="Pending Proposals" actions={<Link to="/farmer/orders" className="text-xs text-green-700 hover:underline">View all</Link>}>
          {pendingProposals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-gray-500 text-sm">No pending proposals.</p>
              <p className="text-xs text-gray-400 mt-1">Check the Demand Radar for matching buyer requirements.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProposals.slice(0, 3).map(({ proposal, item }) => (
                <div key={item.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Proposal from buyer</p>
                    </div>
                    <StatusBadge status={item.acceptanceStatus} />
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    Your contribution: <strong>{item.proposedQuantity} {item.unit}</strong> @ <strong>{formatINR(item.proposedUnitPrice)}/{item.unit}</strong>
                  </p>
                  <p className="text-xs font-medium text-green-700 mb-3">Estimated: {formatINR(item.lineTotal)}</p>
                  <Link to="/farmer/orders">
                    <Button size="sm" variant="primary" className="w-full">Review & Respond</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Recent Activity */}
      <Section title="Recent Platform Activity" className="mt-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {DEMO_RECENT_ACTIVITY.map(act => (
            <div key={act.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">
                  {act.type === 'listing_created' ? '🌱' :
                   act.type === 'requirement_posted' ? '📋' :
                   act.type === 'proposal_sent' ? '📨' :
                   act.type === 'farmer_accepted' ? '✅' : '🎉'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
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
