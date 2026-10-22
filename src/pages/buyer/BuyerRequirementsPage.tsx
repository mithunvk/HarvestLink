// ============================================================
// HARVESTLINK - Buyer Requirements Page
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Button, StatusBadge, EmptyState, Modal } from '../../components/ui';
import { formatDate, formatINR } from '../../lib/utils';
import { Plus, ClipboardList, Search, Pause, XCircle } from 'lucide-react';

export default function BuyerRequirementsPage() {
  const { user } = useAuth();
  const { requirements, updateRequirement } = useDataStore();
  const [confirmClose, setConfirmClose] = useState<string | null>(null);

  if (!user) return null;

  const myReqs = requirements.filter(r => r.buyerId === user.id && r.status !== 'cancelled');

  const handleClose = (id: string) => {
    updateRequirement(id, { status: 'closed' });
    setConfirmClose(null);
  };

  return (
    <div>
      <PageHeader
        title="My Requirements"
        subtitle="Manage your buyer demand requests"
        actions={<Link to="/buyer/requirements/new"><Button leftIcon={<Plus size={15} />}>Post Requirement</Button></Link>}
      />

      {myReqs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={24} />}
          title="No requirements yet"
          description="Post a demand request to connect with farmers who can supply what you need."
          action={<Link to="/buyer/requirements/new"><Button>Post First Requirement</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {myReqs.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">{req.productName}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Posted {formatDate(req.createdAt)}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="grid sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-bold text-gray-800">{req.quantityRequired} {req.unit}</p>
                  </div>
                  {req.gradeRequired && (
                    <div>
                      <p className="text-gray-500">Grade</p>
                      <p className="font-medium text-gray-800">Grade {req.gradeRequired}</p>
                    </div>
                  )}
                  {req.targetPricePerUnit && (
                    <div>
                      <p className="text-gray-500">Target Price</p>
                      <p className="font-medium text-green-700">{formatINR(req.targetPricePerUnit)}/{req.unit}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Delivery Window</p>
                    <p className="font-medium text-gray-800">{formatDate(req.deliveryWindowStart)} – {formatDate(req.deliveryWindowEnd)}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3">📍 {req.deliveryLocation}</p>
                {req.notes && <p className="text-xs text-gray-500 italic mb-3">"{req.notes}"</p>}

                <div className="flex gap-2">
                  {['open', 'partially_matched'].includes(req.status) && (
                    <Link to={`/buyer/matches/${req.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full" leftIcon={<Search size={13} />}>
                        Find Matching Supply
                      </Button>
                    </Link>
                  )}
                  {req.status !== 'closed' && req.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<XCircle size={13} />}
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => setConfirmClose(req.id)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmClose}
        onClose={() => setConfirmClose(null)}
        title="Close Requirement"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmClose(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmClose && handleClose(confirmClose)}>Close Requirement</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">Are you sure you want to close this requirement? Farmers will no longer see it as an active demand.</p>
      </Modal>
    </div>
  );
}
