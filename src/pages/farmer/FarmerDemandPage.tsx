// ============================================================
// HARVESTLINK - Farmer Demand Radar Page
// ============================================================
import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { runDemandRadar } from '../../lib/matchingEngine';
import { PageHeader, StatusBadge, EmptyState, ProgressBar } from '../../components/ui';
import { formatINR, formatDate, gradeColor } from '../../lib/utils';
import { TrendingUp, MapPin, Calendar, Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FarmerDemandPage() {
  const { user } = useAuth();
  const { requirements, listings } = useDataStore();

  if (!user) return null;

  const myListings = listings.filter(l => l.farmerId === user.id && l.status === 'active');

  // For each requirement, check if any of the farmer's listings match
  const matchedRequirements = useMemo(() => {
    const results: Array<{
      requirement: typeof requirements[0];
      myMatchingListings: ReturnType<typeof runDemandRadar>['eligible'];
    }> = [];

    for (const req of requirements.filter(r => ['open', 'partially_matched'].includes(r.status))) {
      const radarResult = runDemandRadar(req, myListings);
      if (radarResult.eligible.length > 0) {
        results.push({ requirement: req, myMatchingListings: radarResult.eligible });
      }
    }
    return results;
  }, [requirements, myListings]);

  return (
    <div>
      <PageHeader
        title="Demand Radar"
        subtitle="Buyer requirements that match your active listings"
      />

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-2">
          <Info size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-blue-800 font-medium mb-1">About Match Scores</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Match scores (0–100) help prioritize results but are not guarantees. They consider crop fit, grade compatibility,
              quantity contribution, location proximity, timing, and price fit. Hard constraints (wrong crop, expired, incompatible grade) always exclude a listing regardless of score.
            </p>
          </div>
        </div>
      </div>

      {myListings.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={24} />}
          title="No active listings"
          description="Add produce listings to see matching buyer requirements."
        />
      ) : matchedRequirements.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={24} />}
          title="No matching requirements right now"
          description={`Your ${myListings.length} active listing(s) don't match any open buyer requirements currently. Check back later.`}
        />
      ) : (
        <div className="space-y-4">
          {matchedRequirements.map(({ requirement, myMatchingListings }) => (
            <div key={requirement.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Requirement Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">{requirement.productName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Required by: <strong>{requirement.buyerName}</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Scale size={11} /> {requirement.quantityRequired} {requirement.unit} needed</span>
                    {requirement.gradeRequired && (
                      <span className={`px-1.5 py-0.5 rounded-full font-medium ${gradeColor(requirement.gradeRequired)}`}>
                        Grade {requirement.gradeRequired} required
                      </span>
                    )}
                    {requirement.targetPricePerUnit && (
                      <span className="flex items-center gap-1">🎯 Target: {formatINR(requirement.targetPricePerUnit)}/{requirement.unit}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {requirement.deliveryLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(requirement.deliveryWindowStart)} – {formatDate(requirement.deliveryWindowEnd)}
                    </span>
                  </div>
                  {requirement.notes && (
                    <p className="text-xs text-gray-500 italic mt-2">"{requirement.notes}"</p>
                  )}
                </div>
                <StatusBadge status={requirement.status} />
              </div>

              {/* Matching Listings */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Your matching listings ({myMatchingListings.length})
                </p>
                <div className="space-y-3">
                  {myMatchingListings.map(({ listing, matchScore, matchExplanation, contributableQuantity }) => (
                    <div key={listing.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {listing.productName} · Grade {listing.grade}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10} />{listing.village}, {listing.taluk}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                            matchScore.total >= 70 ? 'bg-green-100 text-green-700' :
                            matchScore.total >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {matchScore.total}/100
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Match Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                        <div>
                          <p className="text-gray-500">Your available</p>
                          <p className="font-bold text-gray-800">{listing.quantityAvailable} {listing.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Can contribute</p>
                          <p className="font-bold text-green-700">{contributableQuantity} {requirement.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Your price</p>
                          <p className="font-bold text-gray-800">{formatINR(listing.askingPricePerUnit)}/{listing.unit}</p>
                        </div>
                      </div>

                      <ProgressBar
                        value={(contributableQuantity / requirement.quantityRequired) * 100}
                        label={`Covers ${((contributableQuantity / requirement.quantityRequired) * 100).toFixed(0)}% of requirement`}
                        color={contributableQuantity >= requirement.quantityRequired ? 'bg-green-500' : 'bg-amber-400'}
                      />

                      {/* Match Explanations */}
                      <div className="mt-3 space-y-0.5">
                        {matchExplanation.map((exp, i) => (
                          <p key={i} className={`text-xs flex items-start gap-1.5 ${
                            exp.startsWith('✓') ? 'text-green-700' :
                            exp.startsWith('⚠') ? 'text-amber-700' :
                            'text-gray-600'
                          }`}>
                            {exp}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
