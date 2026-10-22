// ============================================================
// HARVESTLINK - Buyer Dashboard
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { StatCard, Section, Button, StatusBadge, EmptyState } from '../../components/ui';
import { formatINR, formatDate, formatRelativeTime } from '../../lib/utils';
import { Plus, ClipboardList, Package, Store, CheckCircle2, TrendingUp } from 'lucide-react';
import { DEMO_RECENT_ACTIVITY } from '../../data/demoData';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { requirements, proposals, orders, getRequirementsByBuyer, getProposalsByBuyer, getOrdersByUser } = useDataStore();

  if (!user) return null;

  const myRequirements = getRequirementsByBuyer(user.id);
  const myProposals = getProposalsByBuyer(user.id);
  const myOrders = getOrdersByUser(user.id, 'buyer');

  const activeReqs = myRequirements.filter(r => r.status === 'open' || r.status === 'partially_matched');
  const matchedReqs = myRequirements.filter(r => r.status === 'matched');
  const pendingProposals = myProposals.filter(p => ['pending_farmer_approval', 'partially_accepted'].includes(p.status));
  const activeOrders = myOrders.filter(o => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.finalTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user.displayName}!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Buyer Dashboard · {user.businessType ?? 'Buyer'}</p>
        </div>
        <Link to="/buyer/requirements/new">
          <Button leftIcon={<Plus size={15} />}>Post Requirement</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Requirements" value={activeReqs.length} icon={<ClipboardList size={18} />} subtitle="Open requests" />
        <StatCard title="Pending Proposals" value={pendingProposals.length} icon={<TrendingUp size={18} />} subtitle="Awaiting farmer response" />
        <StatCard title="Active Orders" value={activeOrders.length} icon={<Package size={18} />} subtitle="In progress" />
        <StatCard title="Total Spent" value={formatINR(totalSpent)} icon={<CheckCircle2 size={18} />} subtitle={`${completedOrders.length} completed`} />
      </div>

      {/* Quick Actions */}
      <Section title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/buyer/requirements/new', label: 'Post Requirement', icon: <Plus size={18} />, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { to: '/buyer/requirements', label: 'My Requirements', icon: <ClipboardList size={18} />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { to: '/marketplace', label: 'Browse Produce', icon: <Store size={18} />, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { to: '/buyer/orders', label: 'View Orders', icon: <Package size={18} />, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 transition-colors cursor-pointer ${a.color}`}>
                {a.icon}<span className="text-xs font-medium text-center leading-tight">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Requirements */}
        <Section title="My Active Requirements" actions={<Link to="/buyer/requirements" className="text-xs text-green-700 hover:underline">View all</Link>}>
          {activeReqs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-gray-500 text-sm">No active requirements.</p>
              <Link to="/buyer/requirements/new"><Button size="sm" className="mt-3">Post First Requirement</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReqs.slice(0, 3).map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{req.productName}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-gray-600">{req.quantityRequired} {req.unit} needed · {req.deliveryLocation}</p>
                  <p className="text-xs text-gray-400 mt-0.5">By {formatDate(req.deliveryWindowEnd)}</p>
                  <Link to={`/buyer/matches/${req.id}`}>
                    <Button size="sm" variant="secondary" className="mt-2 w-full">Find Matches</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Pending Proposals */}
        <Section title="Proposals Awaiting Farmers" actions={<Link to="/buyer/orders" className="text-xs text-green-700 hover:underline">View all</Link>}>
          {pendingProposals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-gray-500 text-sm">No pending proposals.</p>
              <p className="text-xs text-gray-400 mt-1">Post a requirement and propose a collective order to see proposals here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProposals.slice(0, 3).map(proposal => {
                const accepted = proposal.items.filter(i => i.acceptanceStatus === 'accepted').length;
                const total = proposal.items.length;
                return (
                  <div key={proposal.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {proposal.items[0]?.productName}
                        </p>
                        <p className="text-xs text-gray-500">Version {proposal.proposalVersion}</p>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
                    <p className="text-xs text-gray-700 mb-1">
                      {accepted}/{total} farmers accepted · Est. {formatINR(proposal.estimatedTotal)}
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(accepted / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <Section title="Recent Platform Activity" className="mt-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {DEMO_RECENT_ACTIVITY.map(act => (
            <div key={act.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">
                  {act.type === 'listing_created' ? '🌱' : act.type === 'requirement_posted' ? '📋' :
                   act.type === 'proposal_sent' ? '📨' : act.type === 'farmer_accepted' ? '✅' : '🎉'}
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
