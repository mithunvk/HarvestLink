// ============================================================
// HARVESTLINK - Farmer Orders Page (Proposals + Orders)
// ============================================================
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Tabs, StatusBadge, Button, EmptyState, Modal, Textarea, Alert } from '../../components/ui';
import { formatINR, formatDate, formatDateTime } from '../../lib/utils';
import { Package, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function FarmerOrdersPage() {
  const { user } = useAuth();
  const { getProposalItemsByFarmer, getOrdersByUser, respondToProposalItem } = useDataStore();
  const [activeTab, setActiveTab] = useState('proposals');
  const [respondTarget, setRespondTarget] = useState<{ proposalId: string; itemId: string; action: 'accepted' | 'rejected' } | null>(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const myProposalItems = getProposalItemsByFarmer(user.id);
  const myOrders = getOrdersByUser(user.id, 'farmer');

  const pendingItems = myProposalItems.filter(pi => pi.item.acceptanceStatus === 'pending');
  const respondedItems = myProposalItems.filter(pi => pi.item.acceptanceStatus !== 'pending');
  const activeOrders = myOrders.filter(o => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  const handleRespond = () => {
    if (!respondTarget) return;
    respondToProposalItem(respondTarget.proposalId, respondTarget.itemId, respondTarget.action, notes);
    setRespondTarget(null);
    setNotes('');
    setSuccess(`You ${respondTarget.action === 'accepted' ? 'accepted' : 'rejected'} the proposal contribution.`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const tabs = [
    { id: 'proposals', label: 'Pending Proposals', count: pendingItems.length },
    { id: 'active', label: 'Active Orders', count: activeOrders.length },
    { id: 'history', label: 'History' },
  ];

  return (
    <div>
      <PageHeader title="Orders & Proposals" subtitle="Review proposals and track your order contributions" />

      {success && <Alert type="success" message={success} className="mb-4" onDismiss={() => setSuccess('')} />}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* PENDING PROPOSALS */}
      {activeTab === 'proposals' && (
        <div>
          {pendingItems.length === 0 ? (
            <EmptyState icon={<Package size={24} />} title="No pending proposals" description="You'll receive proposals when a buyer's collective order includes your listings." />
          ) : (
            <div className="space-y-4">
              {pendingItems.map(({ proposal, item }) => (
                <div key={item.id} className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center justify-between">
                    <p className="text-sm font-semibold text-amber-800">Proposal Awaiting Your Response</p>
                    <StatusBadge status={item.acceptanceStatus} />
                  </div>
                  <div className="p-5">
                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Product</p>
                        <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Your Contribution</p>
                        <p className="text-sm font-bold text-gray-900">{item.proposedQuantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Your Unit Price</p>
                        <p className="text-sm font-bold text-green-700">{formatINR(item.proposedUnitPrice)}/{item.unit}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Your estimated earnings from this order</p>
                        <p className="text-xl font-bold text-green-700">{formatINR(item.lineTotal)}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Proposal expires</p>
                        <p className="font-medium">{formatDateTime(proposal.expiryAt)}</p>
                      </div>
                    </div>

                    <Alert type="info" message="This is a proposal, not a confirmed order. Your acceptance binds only your contribution. Other farmers in this proposal make their own independent decisions." className="mb-4" />

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        leftIcon={<CheckCircle2 size={15} />}
                        onClick={() => setRespondTarget({ proposalId: proposal.id, itemId: item.id, action: 'accepted' })}
                        className="flex-1"
                      >
                        Accept My Contribution
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<XCircle size={15} />}
                        onClick={() => setRespondTarget({ proposalId: proposal.id, itemId: item.id, action: 'rejected' })}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              {activeOrders.map(order => {
                const myItems = order.items.filter(i => i.farmerId === user.id);
                const myTotal = myItems.reduce((sum, i) => sum + i.lineTotal, 0);
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-mono text-xs text-gray-700">{order.id}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-3">
                      {myItems.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-600">{item.agreedQuantity} {item.unit} @ {formatINR(item.agreedUnitPrice)}/{item.unit}</p>
                          <p className="text-sm font-bold text-green-700 mt-1">{formatINR(item.lineTotal)}</p>
                          <p className="text-xs text-gray-500 mt-1">Fulfilment: <StatusBadge status={item.fulfilmentStatus} /></p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                      <p className="text-gray-600">Delivery: <strong>{order.deliveryLocation}</strong></p>
                      <p className="font-bold text-green-700">Your total: {formatINR(myTotal)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div>
          {respondedItems.length === 0 && completedOrders.length === 0 ? (
            <EmptyState icon={<Package size={24} />} title="No history yet" description="Past proposals and completed orders will appear here." />
          ) : (
            <div className="space-y-3">
              {completedOrders.map(order => {
                const myItems = order.items.filter(i => i.farmerId === user.id);
                const myTotal = myItems.reduce((sum, i) => sum + i.lineTotal, 0);
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {myItems[0]?.productName} — {myItems.map(i => `${i.agreedQuantity} ${i.unit}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">Completed {order.completedAt ? formatDate(order.completedAt) : '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{formatINR(myTotal)}</p>
                      <StatusBadge status="completed" />
                    </div>
                  </div>
                );
              })}
              {respondedItems.map(({ proposal, item }) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.productName} — {item.proposedQuantity} {item.unit}</p>
                    <p className="text-xs text-gray-500">Responded {item.farmerResponseAt ? formatDate(item.farmerResponseAt) : '—'}</p>
                    {item.farmerNotes && <p className="text-xs text-gray-400 italic">"{item.farmerNotes}"</p>}
                  </div>
                  <StatusBadge status={item.acceptanceStatus} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={!!respondTarget}
        onClose={() => { setRespondTarget(null); setNotes(''); }}
        title={respondTarget?.action === 'accepted' ? 'Accept Proposal Contribution' : 'Decline Proposal'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setRespondTarget(null); setNotes(''); }}>Cancel</Button>
            <Button
              variant={respondTarget?.action === 'accepted' ? 'primary' : 'danger'}
              onClick={handleRespond}
            >
              {respondTarget?.action === 'accepted' ? 'Confirm Acceptance' : 'Confirm Decline'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 mb-4">
          {respondTarget?.action === 'accepted'
            ? 'By accepting, you confirm that you will fulfil your proposed contribution at the stated price and quantity. This acceptance is binding for your portion only.'
            : 'By declining, you reject your contribution from this proposal. Other farmers in the proposal are not affected.'}
        </p>
        <Textarea
          label="Notes (optional)"
          id="farmer-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={respondTarget?.action === 'accepted' ? 'Any notes for the buyer...' : 'Reason for declining...'}
        />
      </Modal>
    </div>
  );
}
