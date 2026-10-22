// ============================================================
// HARVESTLINK - Core Types
// ============================================================

export type UserRole = 'farmer' | 'buyer' | 'admin';

export type Language = 'en' | 'kn' | 'tulu';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  phone?: string;
  village?: string;
  taluk?: string;
  district?: string;
  preferredLanguage: Language;
  businessType?: string; // for buyers: retailer, restaurant, wholesaler, etc.
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'spices'
  | 'plantation'
  | 'flowers'
  | 'other';

export interface Product {
  id: string;
  name: string;
  nameKn?: string; // Kannada name
  category: ProductCategory;
  defaultUnit: string;
  active: boolean;
}

export type ListingStatus = 'active' | 'paused' | 'sold_out' | 'expired' | 'removed';
export type Grade = 'A' | 'B' | 'C' | 'mixed' | 'organic' | 'premium';

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName?: string;
  productId: string;
  productName?: string;
  productCategory?: ProductCategory;
  variety?: string;
  quantityTotal: number;
  quantityAvailable: number;
  quantityReserved: number;
  unit: string;
  grade: Grade;
  askingPricePerUnit: number; // in INR
  minimumQuantity: number;
  availableFrom: string; // ISO date
  availableUntil?: string; // ISO date
  village: string;
  taluk: string;
  district: string;
  notes?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export type RequirementStatus =
  | 'open'
  | 'partially_matched'
  | 'matched'
  | 'paused'
  | 'closed'
  | 'cancelled';

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName?: string;
  productId: string;
  productName?: string;
  quantityRequired: number;
  unit: string;
  gradeRequired?: Grade;
  targetPricePerUnit?: number; // nullable - buyer's max price
  deliveryLocation: string;
  deliveryWindowStart: string; // ISO date
  deliveryWindowEnd: string; // ISO date
  notes?: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
}

export type DataType = 'official' | 'imported' | 'manual_admin' | 'demo';

export interface MarketPriceReference {
  id: string;
  productId: string;
  productName?: string;
  marketName: string;
  region: string;
  minPrice?: number;
  modalPrice?: number;
  maxPrice?: number;
  unit: string;
  currency: 'INR';
  observationDate: string; // ISO date
  sourceName: string;
  sourceUrl?: string;
  dataType: DataType;
  importedAt: string;
}

export type ProposalStatus =
  | 'draft'
  | 'pending_farmer_approval'
  | 'partially_accepted'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'revision_required';

export type AcceptanceStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface ProposalItem {
  id: string;
  proposalId: string;
  listingId: string;
  farmerId: string;
  farmerName?: string;
  listingVillage?: string;
  listingTaluk?: string;
  productName?: string;
  proposedQuantity: number;
  unit: string;
  proposedUnitPrice: number;
  lineTotal: number;
  acceptanceStatus: AcceptanceStatus;
  farmerResponseAt?: string;
  farmerNotes?: string;
}

export interface OrderProposal {
  id: string;
  buyerId: string;
  requirementId: string;
  proposalVersion: number;
  status: ProposalStatus;
  productSubtotal: number;
  estimatedLogisticsCost: number;
  estimatedTotal: number;
  currency: 'INR';
  expiryAt: string;
  items: ProposalItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'proposed'
  | 'awaiting_farmer_acceptance'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_dispatch'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'partially_fulfilled'
  | 'disputed'
  | 'cancelled';

export type FulfilmentStatus = 'pending' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'completed';

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  farmerId: string;
  farmerName?: string;
  farmerVillage?: string;
  productName?: string;
  agreedQuantity: number;
  unit: string;
  agreedUnitPrice: number;
  lineTotal: number;
  fulfilmentStatus: FulfilmentStatus;
}

export interface Order {
  id: string;
  proposalId: string;
  buyerId: string;
  buyerName?: string;
  requirementId?: string;
  status: OrderStatus;
  finalSubtotal: number;
  finalLogisticsCost: number;
  finalTotal: number;
  currency: 'INR';
  deliveryLocation: string;
  confirmedAt?: string;
  completedAt?: string;
  items: OrderItem[];
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export type OrderEventType =
  | 'proposal_created'
  | 'farmer_accepted'
  | 'farmer_rejected'
  | 'order_confirmed'
  | 'status_changed'
  | 'delivery_updated'
  | 'completed'
  | 'cancelled'
  | 'dispute_raised'
  | 'demo_action';

export interface OrderEvent {
  id: string;
  orderId: string;
  actorId: string;
  actorName?: string;
  eventType: OrderEventType;
  previousStatus?: OrderStatus | ProposalStatus;
  newStatus?: OrderStatus | ProposalStatus;
  eventDetails?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Matching and Collective Order Types
// ============================================================

export interface MatchScore {
  total: number; // 0-100
  cropMatch: number;
  gradeMatch: number;
  quantityContribution: number;
  locationScore: number;
  timingScore: number;
  priceScore: number;
}

export interface ListingMatch {
  listing: ProduceListing;
  matchScore: MatchScore;
  matchExplanation: string[];
  exclusionReason?: string; // if excluded
  isEligible: boolean;
  contributableQuantity: number;
}

export interface CollectiveSupplyPlan {
  id: string;
  requirementId: string;
  participants: {
    listing: ProduceListing;
    contribution: number; // kg or unit
    unitPrice: number;
    lineTotal: number;
  }[];
  totalQuantity: number;
  requiredQuantity: number;
  shortfall: number;
  surplus: number;
  productSubtotal: number;
  estimatedLogisticsCost: number;
  estimatedTotal: number;
  isFeasible: boolean;
  notes: string[];
}

// ============================================================
// Dashboard/Metrics Types
// ============================================================

export interface FarmerDashboard {
  activeListings: number;
  totalQuantityListed: number;
  openDemandMatches: number;
  pendingProposals: number;
  activeOrders: number;
  completedSales: number;
  totalEarned: number;
  recentActivity: ActivityItem[];
}

export interface BuyerDashboard {
  activeRequirements: number;
  matchedRequirements: number;
  pendingProposals: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  recentActivity: ActivityItem[];
}

export interface AdminDashboard {
  totalFarmers: number;
  totalBuyers: number;
  activeListings: number;
  activeRequirements: number;
  matchingRequirements: number;
  pendingProposals: number;
  confirmedOrders: number;
  completedOrders: number;
  totalCompletedOrderValue: number;
}

export interface ActivityItem {
  id: string;
  type: 'listing_created' | 'requirement_posted' | 'proposal_sent' | 'order_confirmed' | 'order_completed' | 'farmer_accepted';
  description: string;
  timestamp: string;
  linkTo?: string;
}
