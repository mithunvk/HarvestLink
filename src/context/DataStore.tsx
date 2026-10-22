// ============================================================
// HARVESTLINK - Data Store (Demo Mode)
// In-memory store with demo data, simulates a real backend.
// ============================================================

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  ProduceListing,
  BuyerRequirement,
  OrderProposal,
  Order,
  MarketPriceReference,
  Product,
  Profile,
  ListingStatus,
  ProposalItem,
  AcceptanceStatus,
  OrderEvent,
} from '../types';
import {
  DEMO_LISTINGS,
  DEMO_REQUIREMENTS,
  DEMO_PROPOSALS,
  DEMO_ORDERS,
  DEMO_PRICE_REFERENCES,
  DEMO_PRODUCTS,
  DEMO_PROFILES,
} from '../data/demoData';

interface DataStoreValue {
  // Products
  products: Product[];

  // Listings
  listings: ProduceListing[];
  addListing: (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'updatedAt'>) => ProduceListing;
  updateListing: (id: string, updates: Partial<ProduceListing>) => boolean;
  removeListing: (id: string) => boolean;

  // Requirements
  requirements: BuyerRequirement[];
  addRequirement: (req: Omit<BuyerRequirement, 'id' | 'createdAt' | 'updatedAt'>) => BuyerRequirement;
  updateRequirement: (id: string, updates: Partial<BuyerRequirement>) => boolean;

  // Proposals
  proposals: OrderProposal[];
  addProposal: (proposal: Omit<OrderProposal, 'id' | 'createdAt' | 'updatedAt'>) => OrderProposal;
  respondToProposalItem: (proposalId: string, itemId: string, status: AcceptanceStatus, notes?: string) => boolean;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status'], actorId: string, actorName: string) => boolean;

  // Price references
  priceReferences: MarketPriceReference[];

  // Profiles
  profiles: Profile[];
  getProfile: (id: string) => Profile | undefined;

  // Helpers
  getListingsByFarmer: (farmerId: string) => ProduceListing[];
  getRequirementsByBuyer: (buyerId: string) => BuyerRequirement[];
  getProposalsByBuyer: (buyerId: string) => OrderProposal[];
  getOrdersByUser: (userId: string, role: string) => Order[];
  getProposalItemsByFarmer: (farmerId: string) => Array<{ proposal: OrderProposal; item: ProposalItem }>;
}

const DataStoreContext = createContext<DataStoreValue | null>(null);

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [products] = useState<Product[]>(DEMO_PRODUCTS);
  const [listings, setListings] = useState<ProduceListing[]>(DEMO_LISTINGS);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>(DEMO_REQUIREMENTS);
  const [proposals, setProposals] = useState<OrderProposal[]>(DEMO_PROPOSALS);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [priceReferences] = useState<MarketPriceReference[]>(DEMO_PRICE_REFERENCES);
  const [profiles] = useState<Profile[]>(DEMO_PROFILES);

  // ============================================================
  // Listings
  // ============================================================

  const addListing = useCallback((data: Omit<ProduceListing, 'id' | 'createdAt' | 'updatedAt'>): ProduceListing => {
    const product = products.find(p => p.id === data.productId);
    const listing: ProduceListing = {
      ...data,
      id: generateId('listing'),
      productName: product?.name,
      productCategory: product?.category,
      quantityReserved: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setListings(prev => [listing, ...prev]);
    return listing;
  }, [products]);

  const updateListing = useCallback((id: string, updates: Partial<ProduceListing>): boolean => {
    let found = false;
    setListings(prev => prev.map(l => {
      if (l.id === id) {
        found = true;
        // Prevent negative available quantity
        const newAvailable = updates.quantityAvailable !== undefined
          ? Math.max(0, updates.quantityAvailable)
          : l.quantityAvailable;
        return { ...l, ...updates, quantityAvailable: newAvailable, updatedAt: new Date().toISOString() };
      }
      return l;
    }));
    return found;
  }, []);

  const removeListing = useCallback((id: string): boolean => {
    let found = false;
    setListings(prev => prev.map(l => {
      if (l.id === id) {
        found = true;
        return { ...l, status: 'removed' as ListingStatus, updatedAt: new Date().toISOString() };
      }
      return l;
    }));
    return found;
  }, []);

  // ============================================================
  // Requirements
  // ============================================================

  const addRequirement = useCallback((data: Omit<BuyerRequirement, 'id' | 'createdAt' | 'updatedAt'>): BuyerRequirement => {
    const product = products.find(p => p.id === data.productId);
    const req: BuyerRequirement = {
      ...data,
      id: generateId('req'),
      productName: product?.name,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRequirements(prev => [req, ...prev]);
    return req;
  }, [products]);

  const updateRequirement = useCallback((id: string, updates: Partial<BuyerRequirement>): boolean => {
    let found = false;
    setRequirements(prev => prev.map(r => {
      if (r.id === id) {
        found = true;
        return { ...r, ...updates, updatedAt: new Date().toISOString() };
      }
      return r;
    }));
    return found;
  }, []);

  // ============================================================
  // Proposals
  // ============================================================

  const addProposal = useCallback((data: Omit<OrderProposal, 'id' | 'createdAt' | 'updatedAt'>): OrderProposal => {
    const proposal: OrderProposal = {
      ...data,
      id: generateId('proposal'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProposals(prev => [proposal, ...prev]);

    // Reserve inventory for proposed items
    proposal.items.forEach(item => {
      setListings(prev => prev.map(l => {
        if (l.id === item.listingId) {
          const newReserved = l.quantityReserved + item.proposedQuantity;
          const newAvailable = Math.max(0, l.quantityAvailable - item.proposedQuantity);
          return { ...l, quantityReserved: newReserved, quantityAvailable: newAvailable, updatedAt: new Date().toISOString() };
        }
        return l;
      }));
    });

    return proposal;
  }, []);

  const respondToProposalItem = useCallback((
    proposalId: string,
    itemId: string,
    status: AcceptanceStatus,
    notes?: string
  ): boolean => {
    let found = false;
    setProposals(prev => prev.map(proposal => {
      if (proposal.id !== proposalId) return proposal;

      const updatedItems = proposal.items.map(item => {
        if (item.id !== itemId) return item;
        found = true;
        return {
          ...item,
          acceptanceStatus: status,
          farmerResponseAt: new Date().toISOString(),
          farmerNotes: notes,
        };
      });

      // Calculate new proposal status
      const acceptedCount = updatedItems.filter(i => i.acceptanceStatus === 'accepted').length;
      const rejectedCount = updatedItems.filter(i => i.acceptanceStatus === 'rejected').length;
      const pendingCount = updatedItems.filter(i => i.acceptanceStatus === 'pending').length;

      let newStatus = proposal.status;
      if (rejectedCount === updatedItems.length) {
        newStatus = 'rejected';
      } else if (pendingCount === 0 && acceptedCount > 0) {
        newStatus = 'accepted';
      } else if (acceptedCount > 0 && pendingCount > 0) {
        newStatus = 'partially_accepted';
      }

      // If fully accepted, create an order
      if (newStatus === 'accepted' && proposal.status !== 'accepted') {
        const order: Order = {
          id: generateId('order'),
          proposalId: proposal.id,
          buyerId: proposal.buyerId,
          requirementId: proposal.requirementId,
          status: 'confirmed',
          finalSubtotal: proposal.productSubtotal,
          finalLogisticsCost: proposal.estimatedLogisticsCost,
          finalTotal: proposal.estimatedTotal,
          currency: 'INR',
          deliveryLocation: 'As per requirement',
          confirmedAt: new Date().toISOString(),
          items: updatedItems.filter(i => i.acceptanceStatus === 'accepted').map(i => ({
            id: generateId('oi'),
            orderId: generateId('order'),
            listingId: i.listingId,
            farmerId: i.farmerId,
            farmerName: i.farmerName,
            farmerVillage: i.listingVillage,
            productName: i.productName,
            agreedQuantity: i.proposedQuantity,
            unit: i.unit,
            agreedUnitPrice: i.proposedUnitPrice,
            lineTotal: i.lineTotal,
            fulfilmentStatus: 'pending',
          })),
          events: [
            {
              id: generateId('ev'),
              orderId: generateId('order'),
              actorId: 'system',
              actorName: 'System',
              eventType: 'order_confirmed',
              previousStatus: 'awaiting_farmer_acceptance',
              newStatus: 'confirmed',
              createdAt: new Date().toISOString(),
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOrders(prev => [order, ...prev]);
      }

      return { ...proposal, items: updatedItems, status: newStatus, updatedAt: new Date().toISOString() };
    }));
    return found;
  }, []);

  // ============================================================
  // Orders
  // ============================================================

  const updateOrderStatus = useCallback((
    orderId: string,
    status: Order['status'],
    actorId: string,
    actorName: string
  ): boolean => {
    let found = false;
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      found = true;
      const event: OrderEvent = {
        id: generateId('ev'),
        orderId,
        actorId,
        actorName,
        eventType: status === 'completed' ? 'completed' : 'status_changed',
        previousStatus: order.status,
        newStatus: status,
        eventDetails: { note: 'Demo status update' },
        createdAt: new Date().toISOString(),
      };
      return {
        ...order,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : order.completedAt,
        events: [...order.events, event],
        updatedAt: new Date().toISOString(),
      };
    }));
    return found;
  }, []);

  // ============================================================
  // Helpers
  // ============================================================

  const getProfile = useCallback((id: string) => profiles.find(p => p.id === id), [profiles]);

  const getListingsByFarmer = useCallback(
    (farmerId: string) => listings.filter(l => l.farmerId === farmerId),
    [listings]
  );

  const getRequirementsByBuyer = useCallback(
    (buyerId: string) => requirements.filter(r => r.buyerId === buyerId),
    [requirements]
  );

  const getProposalsByBuyer = useCallback(
    (buyerId: string) => proposals.filter(p => p.buyerId === buyerId),
    [proposals]
  );

  const getOrdersByUser = useCallback(
    (userId: string, role: string) => {
      if (role === 'buyer') return orders.filter(o => o.buyerId === userId);
      if (role === 'farmer') return orders.filter(o => o.items.some(i => i.farmerId === userId));
      return orders; // admin sees all
    },
    [orders]
  );

  const getProposalItemsByFarmer = useCallback(
    (farmerId: string) => {
      const result: Array<{ proposal: OrderProposal; item: ProposalItem }> = [];
      proposals.forEach(proposal => {
        proposal.items.forEach(item => {
          if (item.farmerId === farmerId) {
            result.push({ proposal, item });
          }
        });
      });
      return result;
    },
    [proposals]
  );

  return (
    <DataStoreContext.Provider value={{
      products,
      listings,
      addListing,
      updateListing,
      removeListing,
      requirements,
      addRequirement,
      updateRequirement,
      proposals,
      addProposal,
      respondToProposalItem,
      orders,
      updateOrderStatus,
      priceReferences,
      profiles,
      getProfile,
      getListingsByFarmer,
      getRequirementsByBuyer,
      getProposalsByBuyer,
      getOrdersByUser,
      getProposalItemsByFarmer,
    }}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore(): DataStoreValue {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
