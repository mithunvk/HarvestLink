// ============================================================
// HARVESTLINK - Matches Page (Collective Order Assembly)
// ============================================================
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { runDemandRadar, assembleCollectiveOrder } from '../../lib/matchingEngine';
import { PageHeader, Button, Alert, ProgressBar, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, gradeColor } from '../../lib/utils';
import { MapPin, CheckCircle2, AlertCircle, Package, Info, Scale } from 'lucide-react';
import type { ProposalItem } from '../../types';

export default function MatchesPage() {
  const { requirementId } = useParams<{ requirementId: string }>();
  const { user } = useAuth();
  const { requirements, listings, addProposal, profiles } = useDataStore();
  const navigate = useNavigate();
  const [isProposing, setIsProposing] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [error, setError] = useState('');

  const requirement = requirements.find(r => r.id === requirementId);

  const { radarResult, supplyPlan } = useMemo(() => {
    if (!requirement) return { radarResult: null, supplyPlan: null };
    const activeListings = listings.filter(l => l.status === 'active' && l.farmerId !== user?.id);
    const radar = runDemandRadar(requirement, activeListings);
    const plan = assembleCollectiveOrder(requirement, radar.eligible);
    return { radarResult: radar, supplyPlan: plan };
  }, [requirement, listings, user]);

  if (!requirement) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-semibold">Requirement not found.</p>
        <Button variant="secondary" className="mt-3" onClick={() => navigate('/buyer/requirements')}>
          Back to Requirements
        </Button>
      </div>
    );
  }

  const handleProposeOrder = async () => {
    if (!supplyPlan || !supplyPlan.isFeasible || !user) return;
    setIsProposing(true);
    setError('');
    await new Promise(r => setTimeout(r, 700));
    try {
      const items: Omit<ProposalItem, 'id' | 'proposalId'>[] = supplyPlan.participants.map((p, i) => {
        const profile = profiles.find(pr => pr.id === p.listing.farmerId);
        return {
          listingId: p.listing.id,
          farmerId: p.listing.farmerId,
          farmerName: p.listing.farmerName,
          listingVillage: p.listing.village,
          listingTaluk: p.listing.taluk,
          productName: p.listing.productName,
          proposedQuantity: p.contribution,
          unit: requirement.unit,
          proposedUnitPrice: p.unitPrice,
          lineTotal: p.lineTotal,
          acceptanceStatus: 'pending' as const,
        };
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      addProposal({
        buyerId: user.id,
        requirementId: requirement.id,
        proposalVersion: 1,
        status: 'pending_farmer_approval',
        productSubtotal: supplyPlan.productSubtotal,
        estimatedLogisticsCost: supplyPlan.estimatedLogisticsCost,
        estimatedTotal: supplyPlan.estimatedTotal,
        currency: 'INR',
        expiryAt: expiryDate.toISOString(),
        items: items as ProposalItem[],
      });

      setProposalSent(true);
      setTimeout(() => navigate('/buyer/orders'), 2000);
    } catch {
      setError('Failed to send proposal. Please try again.');
    } finally {
      setIsProposing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Supply Matches"
        subtitle={`Finding supply for: ${requirement.productName} — ${requirement.quantityRequired} ${requirement.unit}`}
        breadcrumb={[{ label: 'My Requirements', href: '/buyer/requirements' }, { label: 'Matches' }]}
      />

      {/* Requirement Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Requirement</p>
        <div className="grid sm:grid-cols-4 gap-3 text-xs">
          <div><p className="text-gray-500">Crop</p><p className="font-bold text-gray-900 text-sm">{requirement.productName}</p></div>
          <div><p className="text-gray-500">Quantity</p><p className="font-bold text-gray-800">{requirement.quantityRequired} {requirement.unit}</p></div>
          {requirement.gradeRequired && <div><p className="text-gray-500">Grade</p><p className="font-medium text-gray-800">Grade {requirement.gradeRequired}</p></div>}
          {requirement.targetPricePerUnit && <div><p className="text-gray-500">Target Price</p><p className="font-medium text-green-700">{formatINR(requirement.targetPricePerUnit)}/{requirement.unit}</p></div>}
          <div><p className="text-gray-500">Delivery</p><p className="font-medium text-gray-800">{formatDate(requirement.deliveryWindowStart)} – {formatDate(requirement.deliveryWindowEnd)}</p></div>
          <div><p className="text-gray-500">Location</p><p className="font-medium text-gray-800">{requirement.deliveryLocation}</p></div>
        </div>
      </div>

      {proposalSent && (
        <Alert type="success" title="Proposal Sent!" message="Your collective order proposal has been sent to the participating farmers. Redirecting to orders..." className="mb-5" />
      )}
      {error && <Alert type="error" message={error} className="mb-5" onDismiss={() => setError('')} />}

      {/* Collective Supply Plan */}
      {supplyPlan && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={18} className="text-green-600" />
            Collective Supply Plan
          </h2>

          <div className={`rounded-xl border p-5 mb-4 ${supplyPlan.isFeasible ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              {supplyPlan.isFeasible
                ? <CheckCircle2 size={18} className="text-green-600" />
                : <AlertCircle size={18} className="text-amber-600" />}
              <p className={`font-semibold text-sm ${supplyPlan.isFeasible ? 'text-green-800' : 'text-amber-800'}`}>
                {supplyPlan.isFeasible
                  ? `✓ Feasible plan: ${supplyPlan.totalQuantity} ${requirement.unit} from ${supplyPlan.participants.length} farmer(s)`
                  : `⚠ Partial supply: ${supplyPlan.totalQuantity} ${requirement.unit} available (shortfall: ${supplyPlan.shortfall} ${requirement.unit})`}
              </p>
            </div>

            <ProgressBar
              value={(supplyPlan.totalQuantity / requirement.quantityRequired) * 100}
              label={`${supplyPlan.totalQuantity} of ${requirement.quantityRequired} ${requirement.unit} covered`}
              color={supplyPlan.isFeasible ? 'bg-green-500' : 'bg-amber-400'}
              className="mb-4"
            />

            {/* Participants */}
            <div className="space-y-3 mb-4">
              {supplyPlan.participants.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {p.listing.farmerName?.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.listing.farmerName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={10} />{p.listing.village}, {p.listing.taluk}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${gradeColor(p.listing.grade)}`}>
                        Grade {p.listing.grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{p.contribution} {requirement.unit}</p>
                    <p className="text-xs text-gray-500">@ {formatINR(p.unitPrice)}/{requirement.unit}</p>
                    <p className="text-sm font-bold text-green-700">{formatINR(p.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Estimated Cost</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Produce subtotal ({supplyPlan.participants.length} farmers)</span>
                  <span className="font-medium">{formatINR(supplyPlan.productSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Estimated logistics (indicative)</span>
                  <span>+ {formatINR(supplyPlan.estimatedLogisticsCost)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-900">Estimated Total</span>
                  <span className="text-green-700">{formatINR(supplyPlan.estimatedTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-3 space-y-1">
              {supplyPlan.notes.map((note, i) => (
                <p key={i} className={`text-xs flex items-start gap-1.5 ${note.startsWith('⚠') ? 'text-amber-700' : 'text-gray-600'}`}>
                  {note}
                </p>
              ))}
            </div>

            <Alert
              type="info"
              message="This is an estimated supply plan, not a confirmed order. Each farmer must independently accept their contribution and price before the order is confirmed."
              className="mt-4"
            />

            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={handleProposeOrder}
              isLoading={isProposing}
              disabled={!supplyPlan.isFeasible || proposalSent}
            >
              {supplyPlan.isFeasible ? 'Propose This Order to Farmers' : 'Cannot Propose — Insufficient Supply'}
            </Button>
          </div>
        </section>
      )}

      {/* All Eligible Listings */}
      {radarResult && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">
            All Matching Listings ({radarResult.eligible.length})
          </h2>
          {radarResult.eligible.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-gray-500 text-sm">No matching listings found for this requirement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {radarResult.eligible.map(({ listing, matchScore, matchExplanation, contributableQuantity }) => (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{listing.farmerName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{listing.village}, {listing.taluk}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      matchScore.total >= 70 ? 'bg-green-100 text-green-700' :
                      matchScore.total >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {matchScore.total}/100
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                    <div><p className="text-gray-500">Available</p><p className="font-bold">{listing.quantityAvailable} {listing.unit}</p></div>
                    <div><p className="text-gray-500">Can contribute</p><p className="font-bold text-green-700">{contributableQuantity} {requirement.unit}</p></div>
                    <div><p className="text-gray-500">Price</p><p className="font-bold">{formatINR(listing.askingPricePerUnit)}/{listing.unit}</p></div>
                  </div>
                  <div className="space-y-0.5">
                    {matchExplanation.map((exp, i) => (
                      <p key={i} className={`text-xs ${exp.startsWith('✓') ? 'text-green-700' : exp.startsWith('⚠') ? 'text-amber-700' : 'text-gray-600'}`}>
                        {exp}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Excluded listings */}
      {radarResult && radarResult.excluded.filter(e => e.listing.productId === requirement.productId).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Excluded Listings ({radarResult.excluded.filter(e => e.listing.productId === requirement.productId).length})
          </h2>
          <div className="space-y-2">
            {radarResult.excluded.filter(e => e.listing.productId === requirement.productId).map(({ listing, exclusionReason }) => (
              <div key={listing.id} className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">{listing.farmerName} · {listing.village}</p>
                  <p className="text-xs text-gray-500">{listing.quantityAvailable} {listing.unit} @ {formatINR(listing.askingPricePerUnit)}/{listing.unit}</p>
                </div>
                <p className="text-xs text-red-500 max-w-xs text-right">{exclusionReason}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
