// ============================================================
// HARVESTLINK - Farmer Listings Page
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Button, StatusBadge, EmptyState, Modal, Alert } from '../../components/ui';
import { formatINR, formatDate, gradeColor } from '../../lib/utils';
import { Plus, Edit, Pause, Play, Trash2, Package, Scale } from 'lucide-react';
import type { ProduceListing } from '../../types';

export default function FarmerListingsPage() {
  const { user } = useAuth();
  const { listings, updateListing, removeListing } = useDataStore();
  const [deleteTarget, setDeleteTarget] = useState<ProduceListing | null>(null);
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const myListings = listings.filter(l => l.farmerId === user.id && l.status !== 'removed');

  const handlePauseToggle = (listing: ProduceListing) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    updateListing(listing.id, { status: newStatus });
    setSuccess(`Listing ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeListing(deleteTarget.id);
    setDeleteTarget(null);
    setSuccess('Listing removed.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <PageHeader
        title="My Listings"
        subtitle="Manage your produce listings"
        actions={
          <Link to="/farmer/listings/new">
            <Button leftIcon={<Plus size={15} />}>New Listing</Button>
          </Link>
        }
      />

      {success && <Alert type="success" message={success} className="mb-4" onDismiss={() => setSuccess('')} />}

      {myListings.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No listings yet"
          description="Start listing your produce to connect with buyers in Dakshina Kannada and Udupi."
          action={<Link to="/farmer/listings/new"><Button>Create First Listing</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {myListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-semibold text-gray-900 text-sm">{listing.productName}</h2>
                    {listing.variety && <span className="text-xs text-gray-500">· {listing.variety}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${gradeColor(listing.grade)}`}>
                      Grade {listing.grade}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="text-sm font-bold text-gray-800">{listing.quantityAvailable} {listing.unit}</p>
                      {listing.quantityReserved > 0 && (
                        <p className="text-xs text-amber-600">{listing.quantityReserved} reserved</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Listed</p>
                      <p className="text-sm font-medium text-gray-700">{listing.quantityTotal} {listing.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Asking Price</p>
                      <p className="text-sm font-bold text-green-700">{formatINR(listing.askingPricePerUnit)}/{listing.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available Until</p>
                      <p className="text-sm font-medium text-gray-700">
                        {listing.availableUntil ? formatDate(listing.availableUntil) : 'Ongoing'}
                      </p>
                    </div>
                  </div>

                  {listing.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{listing.notes}"</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link to={`/farmer/listings/${listing.id}/edit`}>
                    <Button size="sm" variant="outline" leftIcon={<Edit size={13} />}>Edit</Button>
                  </Link>
                  {listing.status !== 'sold_out' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={listing.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                      onClick={() => handlePauseToggle(listing)}
                    >
                      {listing.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={13} />}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteTarget(listing)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Listing"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to remove the listing for <strong>{deleteTarget?.productName}</strong>?
          This action cannot be undone.
        </p>
        {deleteTarget && deleteTarget.quantityReserved > 0 && (
          <Alert type="warning" message={`This listing has ${deleteTarget.quantityReserved} ${deleteTarget.unit} reserved in a pending proposal. Removing may affect active proposals.`} className="mt-3" />
        )}
      </Modal>
    </div>
  );
}
