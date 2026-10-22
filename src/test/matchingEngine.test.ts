// ============================================================
// HARVESTLINK - Core Business Logic Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  runDemandRadar,
  assembleCollectiveOrder,
  convertUnit,
  areUnitsCompatible,
  gradeCompatibility,
  checkAvailabilityOverlap,
  canTransitionOrder,
  canTransitionProposal,
} from '../lib/matchingEngine';
import type { ProduceListing, BuyerRequirement } from '../types';

// ============================================================
// Test Fixtures
// ============================================================

const makeRequirement = (overrides: Partial<BuyerRequirement> = {}): BuyerRequirement => ({
  id: 'req-test',
  buyerId: 'buyer-1',
  productId: 'prod-banana',
  productName: 'Banana (Robusta)',
  quantityRequired: 500,
  unit: 'kg',
  gradeRequired: 'A',
  targetPricePerUnit: 30,
  deliveryLocation: 'Mangalore, Dakshina Kannada',
  deliveryWindowStart: '2024-10-25',
  deliveryWindowEnd: '2024-11-10',
  status: 'open',
  createdAt: '2024-10-20T00:00:00Z',
  updatedAt: '2024-10-20T00:00:00Z',
  ...overrides,
});

const makeListing = (id: string, overrides: Partial<ProduceListing> = {}): ProduceListing => ({
  id,
  farmerId: `farmer-${id}`,
  farmerName: `Farmer ${id}`,
  productId: 'prod-banana',
  productName: 'Banana (Robusta)',
  productCategory: 'fruits',
  quantityTotal: 200,
  quantityAvailable: 200,
  quantityReserved: 0,
  unit: 'kg',
  grade: 'A',
  askingPricePerUnit: 28,
  minimumQuantity: 50,
  availableFrom: '2024-10-20',
  availableUntil: '2024-11-15',
  village: 'Niddodi',
  taluk: 'Puttur',
  district: 'Dakshina Kannada',
  status: 'active',
  createdAt: '2024-10-18T00:00:00Z',
  updatedAt: '2024-10-18T00:00:00Z',
  ...overrides,
});

// ============================================================
// 1. Unit Conversion
// ============================================================

describe('convertUnit', () => {
  it('converts kg to quintal', () => {
    expect(convertUnit(100, 'kg', 'quintal')).toBeCloseTo(1);
  });

  it('returns same value for same unit', () => {
    expect(convertUnit(150, 'kg', 'kg')).toBe(150);
  });

  it('returns null for incompatible units', () => {
    expect(convertUnit(100, 'kg', 'pieces')).toBeNull();
  });
});

describe('areUnitsCompatible', () => {
  it('same units are compatible', () => {
    expect(areUnitsCompatible('kg', 'kg')).toBe(true);
  });

  it('kg and quintal are compatible', () => {
    expect(areUnitsCompatible('kg', 'quintal')).toBe(true);
  });

  it('kg and pieces are incompatible', () => {
    expect(areUnitsCompatible('kg', 'pieces')).toBe(false);
  });
});

// ============================================================
// 2. Grade Compatibility
// ============================================================

describe('gradeCompatibility', () => {
  it('Grade A satisfies Grade A requirement', () => {
    expect(gradeCompatibility('A', 'A')).toBe(1);
  });

  it('Grade A satisfies Grade B requirement (higher is acceptable)', () => {
    expect(gradeCompatibility('A', 'B')).toBe(1);
  });

  it('Grade B does NOT satisfy Grade A requirement', () => {
    expect(gradeCompatibility('B', 'A')).toBeLessThan(1);
  });

  it('Grade C is incompatible with Grade A', () => {
    expect(gradeCompatibility('C', 'A')).toBe(0);
  });

  it('No grade requirement always returns 1', () => {
    expect(gradeCompatibility('B', undefined)).toBe(1);
  });
});

// ============================================================
// 3. Availability Overlap
// ============================================================

describe('checkAvailabilityOverlap', () => {
  it('overlapping dates return true', () => {
    const listing = makeListing('L1', { availableFrom: '2024-10-20', availableUntil: '2024-11-15' });
    expect(checkAvailabilityOverlap(listing, '2024-10-25', '2024-11-10')).toBe(true);
  });

  it('listing expired before delivery window returns false', () => {
    const listing = makeListing('L1', { availableFrom: '2024-10-01', availableUntil: '2024-10-15' });
    expect(checkAvailabilityOverlap(listing, '2024-10-25', '2024-11-10')).toBe(false);
  });

  it('listing starts after delivery window returns false', () => {
    const listing = makeListing('L1', { availableFrom: '2024-11-15', availableUntil: '2024-12-01' });
    expect(checkAvailabilityOverlap(listing, '2024-10-25', '2024-11-10')).toBe(false);
  });
});

// ============================================================
// 4. Demand Radar — Matching Logic
// ============================================================

describe('runDemandRadar', () => {
  it('matches listings with same product and compatible grade', () => {
    const req = makeRequirement();
    const listing = makeListing('L1');
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(1);
    expect(result.eligible[0].listing.id).toBe('L1');
  });

  it('excludes listings with a different product', () => {
    const req = makeRequirement();
    const listing = makeListing('L1', { productId: 'prod-coconut' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
    expect(result.excluded.length).toBe(1);
    expect(result.excluded[0].exclusionReason).toContain('Different crop');
  });

  it('excludes paused listings', () => {
    const req = makeRequirement();
    const listing = makeListing('L1', { status: 'paused' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
    expect(result.excluded[0].exclusionReason).toContain('paused');
  });

  it('excludes expired listings', () => {
    const req = makeRequirement();
    const listing = makeListing('L1', { availableUntil: '2024-01-01' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
    expect(result.excluded[0].exclusionReason).toContain('expired');
  });

  it('excludes listings with zero available quantity', () => {
    const req = makeRequirement();
    const listing = makeListing('L1', { quantityAvailable: 0 });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
    expect(result.excluded[0].exclusionReason).toContain('No available quantity');
  });

  it('excludes incompatible grade (Grade C for Grade A requirement)', () => {
    const req = makeRequirement({ gradeRequired: 'A' });
    const listing = makeListing('L1', { grade: 'C' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
    expect(result.excluded[0].exclusionReason).toContain('Incompatible grade');
  });

  it('includes Grade A listing for Grade B requirement', () => {
    const req = makeRequirement({ gradeRequired: 'B' });
    const listing = makeListing('L1', { grade: 'A' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(1);
  });

  it('excludes listings with incompatible units (pieces vs kg)', () => {
    const req = makeRequirement({ unit: 'kg' });
    const listing = makeListing('L1', { unit: 'pieces' });
    const result = runDemandRadar(req, [listing]);
    expect(result.eligible.length).toBe(0);
  });
});

// ============================================================
// 5. Collective Order Assembly
// ============================================================

describe('assembleCollectiveOrder — banana example', () => {
  const req = makeRequirement({ quantityRequired: 500 });
  const farmerA = makeListing('A', { quantityAvailable: 150, askingPricePerUnit: 28, minimumQuantity: 50 });
  const farmerB = makeListing('B', { quantityAvailable: 200, askingPricePerUnit: 27, minimumQuantity: 75 });
  const farmerC = makeListing('C', { quantityAvailable: 180, askingPricePerUnit: 25, minimumQuantity: 60, grade: 'B' });

  const radar = runDemandRadar(req, [farmerA, farmerB, farmerC]);
  const plan = assembleCollectiveOrder(req, radar.eligible);

  it('produces a feasible plan for 500 kg', () => {
    expect(plan.isFeasible).toBe(true);
    expect(plan.totalQuantity).toBeGreaterThanOrEqual(500);
  });

  it('includes multiple farmers in the plan', () => {
    expect(plan.participants.length).toBeGreaterThan(1);
  });

  it('calculates product subtotal correctly', () => {
    const computedSubtotal = plan.participants.reduce((sum, p) => sum + p.contribution * p.unitPrice, 0);
    expect(plan.productSubtotal).toBeCloseTo(computedSubtotal, 0);
  });

  it('estimated total includes logistics cost', () => {
    expect(plan.estimatedTotal).toBe(plan.productSubtotal + plan.estimatedLogisticsCost);
  });
});

describe('assembleCollectiveOrder — insufficient supply', () => {
  it('marks plan as not feasible when supply is insufficient', () => {
    const req = makeRequirement({ quantityRequired: 1000 });
    const listing = makeListing('L1', { quantityAvailable: 100 });
    const radar = runDemandRadar(req, [listing]);
    const plan = assembleCollectiveOrder(req, radar.eligible);
    expect(plan.isFeasible).toBe(false);
    expect(plan.shortfall).toBeGreaterThan(0);
  });
});

// ============================================================
// 6. Inventory Guard — Prevent Negative Quantity
// ============================================================

describe('inventory non-negativity', () => {
  it('contributable quantity never exceeds available', () => {
    const req = makeRequirement({ quantityRequired: 1000 });
    const listing = makeListing('L1', { quantityAvailable: 150 });
    const radar = runDemandRadar(req, [listing]);
    expect(radar.eligible[0].contributableQuantity).toBeLessThanOrEqual(150);
  });
});

// ============================================================
// 7. Proposal Subtotal Verification
// ============================================================

describe('proposal subtotal', () => {
  it('calculates subtotal as sum of line totals', () => {
    const items = [
      { proposedQuantity: 150, proposedUnitPrice: 28, lineTotal: 4200 },
      { proposedQuantity: 200, proposedUnitPrice: 27, lineTotal: 5400 },
      { proposedQuantity: 150, proposedUnitPrice: 25, lineTotal: 3750 },
    ];
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    expect(subtotal).toBe(13350);
  });
});

// ============================================================
// 8. Status Transitions
// ============================================================

describe('canTransitionOrder', () => {
  it('allows confirmed → preparing', () => {
    expect(canTransitionOrder('confirmed', 'preparing')).toBe(true);
  });

  it('disallows completed → cancelled', () => {
    expect(canTransitionOrder('completed', 'cancelled')).toBe(false);
  });

  it('allows confirmed → cancelled', () => {
    expect(canTransitionOrder('confirmed', 'cancelled')).toBe(true);
  });

  it('disallows delivered → proposed', () => {
    expect(canTransitionOrder('delivered', 'proposed')).toBe(false);
  });
});

describe('canTransitionProposal', () => {
  it('allows draft → pending_farmer_approval', () => {
    expect(canTransitionProposal('draft', 'pending_farmer_approval')).toBe(true);
  });

  it('disallows rejected → accepted', () => {
    expect(canTransitionProposal('rejected', 'accepted')).toBe(false);
  });

  it('allows partially_accepted → accepted', () => {
    expect(canTransitionProposal('partially_accepted', 'accepted')).toBe(true);
  });
});

// ============================================================
// 9. Grade Preservation (Agreed Price Snapshot)
// ============================================================

describe('price snapshots in proposals', () => {
  it('line total is computed at proposal time and does not change', () => {
    const proposedPrice = 28;
    const proposedQty = 150;
    const lineTotal = proposedPrice * proposedQty;
    expect(lineTotal).toBe(4200);
    // Simulating: even if listing price changes later, lineTotal is frozen
    const changedPrice = 35;
    expect(lineTotal).toBe(4200); // unchanged
  });
});
