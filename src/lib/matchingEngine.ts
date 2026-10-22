// ============================================================
// HARVESTLINK - Demand Radar & Collective Order Assembly
// Deterministic, rule-based matching. Not AI/ML.
// ============================================================

import type {
  ProduceListing,
  BuyerRequirement,
  ListingMatch,
  MatchScore,
  CollectiveSupplyPlan,
  Grade,
} from '../types';

// ============================================================
// Unit Normalization
// ============================================================

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  kg: { kg: 1, quintal: 0.01, tonne: 0.001, gram: 1000, g: 1000 },
  quintal: { quintal: 1, kg: 100, tonne: 0.1 },
  tonne: { tonne: 1, kg: 1000, quintal: 10 },
  pieces: { pieces: 1, dozen: 1 / 12, hundred: 0.01 },
};

/**
 * Convert quantity from one unit to another.
 * Returns null if conversion is not possible.
 */
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number | null {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();
  if (from === to) return quantity;
  const conversions = UNIT_CONVERSIONS[from];
  if (!conversions || conversions[to] === undefined) return null;
  return quantity * conversions[to];
}

/**
 * Check if units are compatible (can be converted).
 */
export function areUnitsCompatible(unitA: string, unitB: string): boolean {
  if (unitA.toLowerCase() === unitB.toLowerCase()) return true;
  const convA = UNIT_CONVERSIONS[unitA.toLowerCase()];
  return convA !== undefined && convA[unitB.toLowerCase()] !== undefined;
}

// ============================================================
// Grade Compatibility
// ============================================================

const GRADE_HIERARCHY: Record<Grade, number> = {
  premium: 5,
  organic: 4,
  A: 3,
  B: 2,
  C: 1,
  mixed: 1,
};

/**
 * Check if listing grade is compatible with requirement grade.
 * Grade A listing satisfies Grade B requirement (higher is always acceptable).
 * Returns a compatibility score 0-1.
 */
export function gradeCompatibility(listingGrade: Grade, requiredGrade: Grade | undefined): number {
  if (!requiredGrade) return 1; // No grade requirement = always compatible
  const listingLevel = GRADE_HIERARCHY[listingGrade] ?? 0;
  const requiredLevel = GRADE_HIERARCHY[requiredGrade] ?? 0;
  if (listingLevel >= requiredLevel) return 1; // Compatible
  if (listingLevel === requiredLevel - 1) return 0.5; // Borderline
  return 0; // Incompatible
}

// ============================================================
// Availability Check
// ============================================================

/**
 * Check if listing availability overlaps with delivery window.
 */
export function checkAvailabilityOverlap(
  listing: ProduceListing,
  deliveryStart: string,
  deliveryEnd: string
): boolean {
  const listingFrom = new Date(listing.availableFrom).getTime();
  const listingUntil = listing.availableUntil
    ? new Date(listing.availableUntil).getTime()
    : Infinity;
  const delivFrom = new Date(deliveryStart).getTime();
  const delivUntil = new Date(deliveryEnd).getTime();

  // Listing must be available before or during the delivery window
  return listingFrom <= delivUntil && listingUntil >= delivFrom;
}

// ============================================================
// Location Score
// ============================================================

/**
 * Simple location compatibility score based on district/taluk match.
 * In a real system this would use GPS coordinates and routing.
 */
export function locationScore(
  listingDistrict: string,
  listingTaluk: string,
  deliveryLocation: string
): number {
  const delivery = deliveryLocation.toLowerCase();
  const district = listingDistrict.toLowerCase();
  const taluk = listingTaluk.toLowerCase();

  // Same district = good, nearby districts (coastal Karnataka) = acceptable
  const coastalDistricts = ['dakshina kannada', 'udupi', 'uttara kannada'];
  const inCoastal = coastalDistricts.some(d => district.includes(d.split(' ')[0]));

  if (delivery.includes(district) || delivery.includes(taluk)) return 1;
  if (inCoastal) return 0.7; // Within the same region
  return 0.4; // Further away
}

// ============================================================
// Price Score
// ============================================================

/**
 * Score how well the listing price fits the buyer's target price.
 */
export function priceScore(askingPrice: number, targetPrice: number | undefined): number {
  if (!targetPrice) return 0.8; // No price constraint = neutral
  if (askingPrice <= targetPrice) return 1; // Within budget
  const overage = (askingPrice - targetPrice) / targetPrice;
  if (overage <= 0.1) return 0.7; // Up to 10% over
  if (overage <= 0.2) return 0.4; // Up to 20% over
  return 0.1; // Significantly over
}

// ============================================================
// DEMAND RADAR — Match Listings to Requirement
// ============================================================

export interface DemandRadarResult {
  eligible: ListingMatch[];
  excluded: ListingMatch[];
}

export function runDemandRadar(
  requirement: BuyerRequirement,
  listings: ProduceListing[]
): DemandRadarResult {
  const eligible: ListingMatch[] = [];
  const excluded: ListingMatch[] = [];

  const now = new Date().toISOString();

  for (const listing of listings) {
    const explanations: string[] = [];
    const exclusions: string[] = [];

    // === HARD FILTERS ===

    // 1. Product must match
    if (listing.productId !== requirement.productId) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 0, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: [],
        exclusionReason: 'Different crop/product',
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // 2. Listing must be active
    if (listing.status !== 'active') {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop'],
        exclusionReason: `Listing is ${listing.status}`,
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // 3. Must not be expired before requirement delivery window
    const refDate = requirement.deliveryWindowStart;
    if (listing.availableUntil && refDate && listing.availableUntil < refDate) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop'],
        exclusionReason: 'Listing has expired',
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // 4. Must have positive available quantity
    if (listing.quantityAvailable <= 0) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop'],
        exclusionReason: 'No available quantity',
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // 5. Units must be compatible
    if (!areUnitsCompatible(listing.unit, requirement.unit)) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop'],
        exclusionReason: `Incompatible units: ${listing.unit} vs ${requirement.unit}`,
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // === SOFT SCORING ===

    const gradeCompat = gradeCompatibility(listing.grade, requirement.gradeRequired);

    // 6. Grade check (hard exclude if completely incompatible)
    if (gradeCompat === 0) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: 0, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop'],
        exclusionReason: `Incompatible grade: listing is Grade ${listing.grade}, requirement is Grade ${requirement.gradeRequired}`,
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // 7. Availability timing
    const timingOk = checkAvailabilityOverlap(
      listing,
      requirement.deliveryWindowStart,
      requirement.deliveryWindowEnd
    );

    if (!timingOk) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: gradeCompat, quantityContribution: 0, locationScore: 0, timingScore: 0, priceScore: 0 },
        matchExplanation: ['Same crop', `Grade ${listing.grade} compatible`],
        exclusionReason: 'Availability does not overlap with delivery window',
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // === CONVERT QUANTITIES ===
    const availableInRequirementUnit = convertUnit(listing.quantityAvailable, listing.unit, requirement.unit) ?? listing.quantityAvailable;
    const minQtyInRequirementUnit = convertUnit(listing.minimumQuantity, listing.unit, requirement.unit) ?? listing.minimumQuantity;

    // 8. Must meet minimum quantity
    if (availableInRequirementUnit < minQtyInRequirementUnit) {
      excluded.push({
        listing,
        matchScore: { total: 0, cropMatch: 1, gradeMatch: gradeCompat, quantityContribution: 0, locationScore: 0.7, timingScore: 1, priceScore: 0 },
        matchExplanation: ['Same crop', `Grade ${listing.grade} compatible`, 'Timing compatible'],
        exclusionReason: `Available quantity (${availableInRequirementUnit} ${requirement.unit}) is below farmer's minimum (${minQtyInRequirementUnit} ${requirement.unit})`,
        isEligible: false,
        contributableQuantity: 0,
      });
      continue;
    }

    // === ALL HARD FILTERS PASSED — calculate score ===

    explanations.push(`✓ Same crop: ${listing.productName}`);
    if (gradeCompat === 1) {
      explanations.push(`✓ Grade ${listing.grade} meets requirement${requirement.gradeRequired ? ` (Grade ${requirement.gradeRequired})` : ''}`);
    } else {
      explanations.push(`⚠ Grade ${listing.grade} — borderline for required Grade ${requirement.gradeRequired}`);
    }

    const locScore = locationScore(listing.district, listing.taluk, requirement.deliveryLocation);
    explanations.push(`✓ Available: ${listing.availableFrom} – ${listing.availableUntil ?? 'ongoing'}`);
    if (locScore >= 0.8) {
      explanations.push(`✓ Located in ${listing.taluk}, ${listing.district} — close to delivery location`);
    } else {
      explanations.push(`ℹ Located in ${listing.taluk}, ${listing.district} — transport from this area to ${requirement.deliveryLocation}`);
    }

    const pScore = priceScore(listing.askingPricePerUnit, requirement.targetPricePerUnit);
    if (requirement.targetPricePerUnit) {
      if (listing.askingPricePerUnit <= requirement.targetPricePerUnit) {
        explanations.push(`✓ Asking ₹${listing.askingPricePerUnit}/${listing.unit} — within target ₹${requirement.targetPricePerUnit}/${requirement.unit}`);
      } else {
        explanations.push(`⚠ Asking ₹${listing.askingPricePerUnit}/${listing.unit} — above target ₹${requirement.targetPricePerUnit}/${requirement.unit}`);
      }
    } else {
      explanations.push(`ℹ Asking ₹${listing.askingPricePerUnit}/${listing.unit} — no target price set`);
    }

    const contributableQty = Math.min(availableInRequirementUnit, requirement.quantityRequired);
    const quantityContrib = Math.min(1, contributableQty / requirement.quantityRequired);
    explanations.push(`ℹ Can contribute up to ${contributableQty} ${requirement.unit} of ${requirement.quantityRequired} ${requirement.unit} required`);

    const score: MatchScore = {
      cropMatch: 1,
      gradeMatch: gradeCompat,
      quantityContribution: quantityContrib,
      locationScore: locScore,
      timingScore: 1,
      priceScore: pScore,
      total: Math.round(
        (1 * 0.30 + gradeCompat * 0.20 + quantityContrib * 0.20 + locScore * 0.15 + 1 * 0.05 + pScore * 0.10) * 100
      ),
    };

    eligible.push({
      listing,
      matchScore: score,
      matchExplanation: explanations,
      isEligible: true,
      contributableQuantity: contributableQty,
    });
  }

  // Sort eligible by match score descending
  eligible.sort((a, b) => b.matchScore.total - a.matchScore.total);

  return { eligible, excluded };
}

// ============================================================
// COLLECTIVE ORDER ASSEMBLY
// Greedy algorithm: pick the best-scoring listings until
// the requirement is met or all eligible listings are used.
// ============================================================

export function assembleCollectiveOrder(
  requirement: BuyerRequirement,
  eligibleMatches: ListingMatch[],
  estimatedLogisticsCostPerUnit: number = 1.5
): CollectiveSupplyPlan {
  const notes: string[] = [
    '⚠ These are estimated values based on stated quantities and prices.',
    'Logistics costs are indicative only and do not include GST or other levies.',
    'Final prices are subject to each farmer\'s acceptance and inventory verification.',
  ];

  let remainingQty = requirement.quantityRequired;
  const participants: CollectiveSupplyPlan['participants'] = [];

  // Sort by score desc (already done in radar)
  const sorted = [...eligibleMatches].sort((a, b) => b.matchScore.total - a.matchScore.total);

  for (const match of sorted) {
    if (remainingQty <= 0) break;

    const { listing, contributableQuantity } = match;

    // How much can this listing contribute?
    const contribute = Math.min(contributableQuantity, remainingQty);

    if (contribute < listing.minimumQuantity) {
      notes.push(`ℹ ${listing.farmerName} skipped: remaining need (${contribute} ${requirement.unit}) is below their minimum (${listing.minimumQuantity} ${listing.unit})`);
      continue;
    }

    participants.push({
      listing,
      contribution: contribute,
      unitPrice: listing.askingPricePerUnit,
      lineTotal: contribute * listing.askingPricePerUnit,
    });
    remainingQty -= contribute;
  }

  const totalQty = participants.reduce((sum, p) => sum + p.contribution, 0);
  const productSubtotal = participants.reduce((sum, p) => sum + p.lineTotal, 0);
  const estimatedLogisticsCost = Math.round(totalQty * estimatedLogisticsCostPerUnit);
  const estimatedTotal = productSubtotal + estimatedLogisticsCost;

  const shortfall = Math.max(0, requirement.quantityRequired - totalQty);
  const surplus = Math.max(0, totalQty - requirement.quantityRequired);

  if (shortfall > 0) {
    notes.push(`⚠ Supply shortfall: ${shortfall} ${requirement.unit} not covered by available listings.`);
  }
  if (surplus > 0) {
    notes.push(`ℹ Plan slightly exceeds requirement by ${surplus} ${requirement.unit} to meet minimum quantities.`);
  }

  notes.push(`ℹ Logistics cost estimated at ₹${estimatedLogisticsCostPerUnit}/${requirement.unit}. Actual cost varies by distance and arrangement.`);

  return {
    id: `plan-${Date.now()}`,
    requirementId: requirement.id,
    participants,
    totalQuantity: totalQty,
    requiredQuantity: requirement.quantityRequired,
    shortfall,
    surplus,
    productSubtotal,
    estimatedLogisticsCost,
    estimatedTotal,
    isFeasible: shortfall === 0 && participants.length > 0,
    notes,
  };
}

// ============================================================
// Proposal Status Transitions (enforced rules)
// ============================================================

type ProposalStatus = 'draft' | 'pending_farmer_approval' | 'partially_accepted' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'revision_required';
type OrderStatus = 'proposed' | 'awaiting_farmer_acceptance' | 'confirmed' | 'preparing' | 'ready_for_dispatch' | 'in_transit' | 'delivered' | 'completed' | 'partially_fulfilled' | 'disputed' | 'cancelled';

const ALLOWED_PROPOSAL_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ['pending_farmer_approval', 'cancelled'],
  pending_farmer_approval: ['partially_accepted', 'accepted', 'rejected', 'expired', 'cancelled', 'revision_required'],
  partially_accepted: ['accepted', 'rejected', 'revision_required', 'cancelled'],
  accepted: ['cancelled'],
  rejected: [],
  expired: [],
  cancelled: [],
  revision_required: ['pending_farmer_approval', 'cancelled'],
};

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  proposed: ['awaiting_farmer_acceptance', 'cancelled'],
  awaiting_farmer_acceptance: ['confirmed', 'partially_fulfilled', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_dispatch', 'cancelled'],
  ready_for_dispatch: ['in_transit'],
  in_transit: ['delivered', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: [],
  partially_fulfilled: ['completed', 'cancelled'],
  disputed: ['completed', 'cancelled'],
  cancelled: [],
};

export function canTransitionProposal(current: ProposalStatus, next: ProposalStatus): boolean {
  return ALLOWED_PROPOSAL_TRANSITIONS[current]?.includes(next) ?? false;
}

export function canTransitionOrder(current: OrderStatus, next: OrderStatus): boolean {
  return ALLOWED_ORDER_TRANSITIONS[current]?.includes(next) ?? false;
}
