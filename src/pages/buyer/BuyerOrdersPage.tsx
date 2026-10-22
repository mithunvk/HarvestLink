// ============================================================
// HARVESTLINK - Buyer Orders Page
// ============================================================
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Tabs, StatusBadge, EmptyState, Button, Alert } from '../../components/ui';
import { formatINR, formatDate, formatDateTime } from '../../lib/utils';
import { Package, CheckCircle2 } from 'lucide-react';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const { getProposalsByBuyer, getOrdersByUser, updateOrderStatus } = useDataStore();
  const [activeTab, setActiveTab] = useState('proposals');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const myProposals = getProposalsByBuyer(user.id);
  const myOrders = getOrdersByUser(user.id, 'buyer');

  const activeProposals = myProposals.filter(p => ['pending_farmer_approval', 'partially_accepted', 'accepted'].includes(p.status));
  const activeOrders = myOrders.filter(o => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit', 'delivered'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  const handleMarkDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'completed', user.id, user.displayName);
    setSuccess('Order marked as completed. Thank you for using HARVESTLINK!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const tabs = [
    { id: 'proposals', label: 'Proposals', count: activeProposals.length },
    { id: 'active', label: 'Active Orders', count: activeOrders.length },
    { id: 'completed', label: 'Completed', count: completedOrders.length },
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle="Track proposals, active orders, and completed purchases" />

      {success && <Alert type="success" message={success} className="mb-4" onDismiss={() => setSuccess('')} />}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* PROPOSALS */}
      {activeTab === 'proposals' && (
        <div>
          {activeProposals.length === 0 ? (
            <EmptyState icon={<Package size={24} />} title="No proposals" description="Create a requirement and propose a collective order to see proposals here." />
          ) : (
            <div className="space-y-4">
              {activeProposals.map(proposal => {
                const accepted = proposal.items.filter(i => i.acceptanceStatus === 'accepted').length;
                const rejected = proposal.items.filter(i => i.acceptanceStatus === 'rejected').length;
                const pending = proposal.items.filter(i => i.acceptanceStatus === 'pending').length;
                return (
                  <div key={proposal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {proposal.items[0]?.productName} — Collective Order
                        </p>
                        <p className="text-xs text-gray-500">Version {proposal.proposalVersion} · Expires {formatDate(proposal.expiryAt)}</p>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
                    <div className="p-5">
                      {/* Farmer acceptance breakdown */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Farmer Responses</p>
                        <div className="space-y-2">
                          {proposal.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-xs font-medium text-gray-800">{item.farmerName}</p>
                                <p className="text-xs text-gray-500">{item.proposedQuantity} {item.unit} @ {formatINR(item.proposedUnitPrice)}/{item.unit}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-green-700">{formatINR(item.lineTotal)}</p>
                                <StatusBadge status={item.acceptanceStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs mt-2 text-gray-600">
                          <span className="text-green-600">✓ {accepted} accepted</span>
                          <span className="text-amber-600">⏳ {pending} pending</span>
                          {rejected > 0 && <span className="text-red-500">✗ {rejected} rejected</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs border-t border-gray-100 pt-3">
                        <div><p className="text-gray-500">Produce Subtotal</p><p className="font-bold">{formatINR(proposal.productSubtotal)}</p></div>
                        <div><p className="text-gray-500">Est. Logistics</p><p className="font-bold">+ {formatINR(proposal.estimatedLogisticsCost)}</p></div>
                        <div><p className="text-gray-500">Estimated Total</p><p className="font-bold text-green-700">{formatINR(proposal.estimatedTotal)}</p></div>
                      </div>

                      {rejected > 0 && (
                        <Alert type="warning" message={`${rejected} farmer(s) declined. A revised proposal may be needed for the rejected portions.`} className="mt-3" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE ORDERS */}
      {activeTab === 'active' && (
        <div>
          {activeOrders.length === 0 ? (
            <EmptyState icon={<Package size={24} />} title="No active orders" description="Confirmed orders will appear here." />
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Order #{order.id.slice(-8)}</p>
                      <p className="text-xs text-gray-500">Confirmed {order.confirmedAt ? formatDate(order.confirmedAt) : '—'}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="p-5">
                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.farmerName} — {item.agreedQuantity} {item.unit} of {item.productName}</span>
                          <span className="font-medium">{formatINR(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mb-4">
                      <span>Total</span>
                      <span className="text-green-700">{formatINR(order.finalTotal)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">📍 Delivery: {order.deliveryLocation}</p>

                    {order.status === 'delivered' && (
                      <Button
                        variant="primary"
                        leftIcon={<CheckCircle2 size={14} />}
                        onClick={() => handleMarkDelivered(order.id)}
                        className="w-full"
                      >
                        Confirm Receipt & Complete Order
                      </Button>
                    )}
                    {order.status !== 'delivered' && (
                      <Alert type="info" message={`Current status: ${order.status.replace(/_/g, ' ')}. The buyer can mark as received when delivered.`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED */}
      {activeTab === 'completed' && (
        <div>
          {completedOrders.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={24} />} title="No completed orders yet" description="Your completed order history will appear here." />
          ) : (
            <div className="space-y-3">
              {completedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.items.map(i => i.productName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.reduce((sum, i) => sum + i.agreedQuantity, 0)} {order.items[0]?.unit} from {order.items.length} farmer(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Completed {order.completedAt ? formatDate(order.completedAt) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatINR(order.finalTotal)}</p>
                    <StatusBadge status="completed" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
