// ============================================================
// HARVESTLINK - Admin Pages (Users, Listings, Prices, Orders)
// ============================================================
import React, { useState } from 'react';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, StatusBadge, Badge, Alert } from '../../components/ui';
import { formatINR, formatDate, roleLabel, gradeColor } from '../../lib/utils';
import { Users } from 'lucide-react';

export function AdminUsersPage() {
  const { profiles } = useDataStore();
  return (
    <div>
      <PageHeader title="Users" subtitle="All registered users — Demo data only" />
      <Alert type="info" message="In production, user management actions (role changes, suspensions) must be executed via server-side admin functions with service-role credentials." className="mb-4" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm" aria-label="Users table">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.displayName}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.role === 'farmer' ? 'bg-green-100 text-green-700' :
                    p.role === 'buyer' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{roleLabel(p.role)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{[p.village, p.taluk, p.district].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminListingsPage() {
  const { listings } = useDataStore();
  return (
    <div>
      <PageHeader title="All Listings" subtitle="Review produce listings across the platform" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]" aria-label="Listings table">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Farmer</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-right px-4 py-3 font-medium">Available</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Grade</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listings.filter(l => l.status !== 'removed').map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{l.productName}</td>
                <td className="px-4 py-3 text-gray-700">{l.farmerName}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{l.village}, {l.taluk}</td>
                <td className="px-4 py-3 text-right font-medium">{l.quantityAvailable} {l.unit}</td>
                <td className="px-4 py-3 text-right text-green-700 font-medium">{formatINR(l.askingPricePerUnit)}/{l.unit}</td>
                <td className="px-4 py-3"><span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${gradeColor(l.grade)}`}>Grade {l.grade}</span></td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPricesPage() {
  const { priceReferences, products } = useDataStore();
  return (
    <div>
      <PageHeader title="Market Price References" subtitle="Manage reference price data" />
      <Alert type="info" message="In production, price data can be imported from AGMARKNET or other official sources via the replaceable data provider interface. All current data is demo-only." className="mb-4" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]" aria-label="Price references table">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Market</th>
              <th className="text-right px-4 py-3 font-medium">Min</th>
              <th className="text-right px-4 py-3 font-medium">Modal</th>
              <th className="text-right px-4 py-3 font-medium">Max</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {priceReferences.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.productName}</td>
                <td className="px-4 py-3 text-gray-700">{p.marketName}</td>
                <td className="px-4 py-3 text-right text-red-600">{p.minPrice ? formatINR(p.minPrice) : '—'}</td>
                <td className="px-4 py-3 text-right text-green-700 font-bold">{p.modalPrice ? formatINR(p.modalPrice) : '—'}</td>
                <td className="px-4 py-3 text-right text-blue-600">{p.maxPrice ? formatINR(p.maxPrice) : '—'}</td>
                <td className="px-4 py-3 text-gray-600">/{p.unit}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.observationDate)}</td>
                <td className="px-4 py-3"><span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{p.dataType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useDataStore();
  const [success, setSuccess] = useState('');

  const handleSimulateDelivery = (orderId: string, currentStatus: string) => {
    const nextMap: Record<string, string> = {
      confirmed: 'preparing',
      preparing: 'ready_for_dispatch',
      ready_for_dispatch: 'in_transit',
      in_transit: 'delivered',
      delivered: 'completed',
    };
    const next = nextMap[currentStatus];
    if (next) {
      updateOrderStatus(orderId, next as any, 'admin-001', 'HarvestLink Admin');
      setSuccess(`Order advanced to: ${next.replace(/_/g, ' ')} (demo simulation)`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div>
      <PageHeader title="All Orders" subtitle="Review and manage orders — Admin view" />
      <Alert type="warning" message="Delivery milestone simulation below is for demo purposes only. These are admin demo actions, labelled accordingly in the audit trail." className="mb-4" />
      {success && <Alert type="success" message={success} className="mb-4" onDismiss={() => setSuccess('')} />}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Order #{order.id.slice(-12)}</p>
                <p className="text-xs text-gray-500">Buyer: {order.buyerName} · Created {formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
              <div><p className="text-gray-500">Subtotal</p><p className="font-bold">{formatINR(order.finalSubtotal)}</p></div>
              <div><p className="text-gray-500">Logistics</p><p className="font-bold">{formatINR(order.finalLogisticsCost)}</p></div>
              <div><p className="text-gray-500">Total</p><p className="font-bold text-green-700">{formatINR(order.finalTotal)}</p></div>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map(item => (
                <p key={item.id} className="text-xs text-gray-600">
                  {item.farmerName}: {item.agreedQuantity} {item.unit} {item.productName} @ {formatINR(item.agreedUnitPrice)}/{item.unit} = {formatINR(item.lineTotal)}
                </p>
              ))}
            </div>
            {!['completed', 'cancelled'].includes(order.status) && (
              <button
                onClick={() => handleSimulateDelivery(order.id, order.status)}
                className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-100"
              >
                🎭 Demo: Advance to Next Status
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
