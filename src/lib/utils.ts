// ============================================================
// HARVESTLINK - Utility Functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees.
 */
export function formatINR(amount: number, decimals: number = 0): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a date as human-readable (DD Mon YYYY).
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date-time as human-readable.
 */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/**
 * Format quantity with unit.
 */
export function formatQty(quantity: number, unit: string): string {
  const formatted = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(2);
  return `${formatted} ${unit}`;
}

/**
 * Format price per unit.
 */
export function formatPricePerUnit(price: number, unit: string): string {
  return `₹${price} per ${unit}`;
}

/**
 * Truncate text to a max length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Grade badge color.
 */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'premium': return 'bg-purple-100 text-purple-800';
    case 'organic': return 'bg-green-100 text-green-800';
    case 'A': return 'bg-emerald-100 text-emerald-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C': return 'bg-gray-100 text-gray-700';
    case 'mixed': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Status badge styles.
 */
export function statusColor(status: string): string {
  switch (status) {
    // Order statuses
    case 'completed': return 'bg-green-100 text-green-800';
    case 'confirmed': return 'bg-emerald-100 text-emerald-800';
    case 'preparing': return 'bg-blue-100 text-blue-800';
    case 'ready_for_dispatch': return 'bg-indigo-100 text-indigo-800';
    case 'in_transit': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-teal-100 text-teal-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'disputed': return 'bg-orange-100 text-orange-800';
    // Proposal statuses
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'pending_farmer_approval': return 'bg-amber-100 text-amber-800';
    case 'partially_accepted': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-gray-100 text-gray-600';
    // Listing statuses
    case 'active': return 'bg-emerald-100 text-emerald-700';
    case 'paused': return 'bg-gray-100 text-gray-600';
    case 'sold_out': return 'bg-red-100 text-red-700';
    // Requirement statuses
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'matched': return 'bg-green-100 text-green-800';
    case 'partially_matched': return 'bg-amber-100 text-amber-800';
    case 'closed': return 'bg-gray-100 text-gray-600';
    // Acceptance statuses
    case 'pending': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

/**
 * Human-readable status label.
 */
export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    paused: 'Paused',
    sold_out: 'Sold Out',
    expired: 'Expired',
    removed: 'Removed',
    open: 'Open',
    partially_matched: 'Partially Matched',
    matched: 'Matched',
    closed: 'Closed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    pending_farmer_approval: 'Awaiting Farmers',
    partially_accepted: 'Partially Accepted',
    accepted: 'Accepted',
    rejected: 'Rejected',
    revision_required: 'Revision Required',
    proposed: 'Proposed',
    awaiting_farmer_acceptance: 'Awaiting Acceptance',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready_for_dispatch: 'Ready for Dispatch',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
    partially_fulfilled: 'Partially Fulfilled',
    disputed: 'Disputed',
    pending: 'Pending',
  };
  return labels[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Category display name.
 */
export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    fruits: 'Fruits',
    vegetables: 'Vegetables',
    grains: 'Grains & Cereals',
    spices: 'Spices & Condiments',
    plantation: 'Plantation Crops',
    flowers: 'Flowers',
    other: 'Other',
  };
  return labels[category] ?? category;
}

/**
 * Role display label.
 */
export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    admin: 'Admin',
  };
  return labels[role] ?? role;
}

/**
 * Check if a date string has passed.
 */
export function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

/**
 * Calculate days remaining until a date.
 */
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / 86400000);
}

/**
 * Safely parse a positive number.
 */
export function parsePositiveNumber(value: string | number): number | null {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n) || n <= 0) return null;
  return n;
}
