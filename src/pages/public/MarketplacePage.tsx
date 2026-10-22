// ============================================================
// HARVESTLINK - Marketplace Page
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../context/DataStore';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader, Card, Badge, StatusBadge, Button, Input, Select, EmptyState
} from '../../components/ui';
import { formatINR, formatDate, gradeColor, categoryLabel } from '../../lib/utils';
import { Search, Filter, MapPin, Calendar, Scale, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';
import type { ProductCategory, Grade } from '../../types';

const GRADE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Grades' },
  { value: 'premium', label: 'Premium' },
  { value: 'organic', label: 'Organic' },
  { value: 'A', label: 'Grade A' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' },
  { value: 'mixed', label: 'Mixed' },
];

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Categories' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'spices', label: 'Spices & Condiments' },
  { value: 'plantation', label: 'Plantation Crops' },
  { value: 'flowers', label: 'Flowers' },
];

const DISTRICT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Districts' },
  { value: 'Dakshina Kannada', label: 'Dakshina Kannada' },
  { value: 'Udupi', label: 'Udupi' },
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'qty_desc', label: 'Quantity: Highest' },
];

export default function MarketplacePage() {
  const { listings } = useDataStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [grade, setGrade] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const activeListings = useMemo(() => {
    return listings.filter(l => l.status === 'active');
  }, [listings]);

  const filtered = useMemo(() => {
    let result = activeListings;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.productName?.toLowerCase().includes(q) ||
        l.farmerName?.toLowerCase().includes(q) ||
        l.village?.toLowerCase().includes(q) ||
        l.taluk?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q)
      );
    }

    if (category) {
      result = result.filter(l => l.productCategory === category);
    }

    if (district) {
      result = result.filter(l => l.district === district);
    }

    if (grade) {
      result = result.filter(l => l.grade === grade);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) result = result.filter(l => l.askingPricePerUnit >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) result = result.filter(l => l.askingPricePerUnit <= max);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc': return [...result].sort((a, b) => a.askingPricePerUnit - b.askingPricePerUnit);
      case 'price_desc': return [...result].sort((a, b) => b.askingPricePerUnit - a.askingPricePerUnit);
      case 'qty_desc': return [...result].sort((a, b) => b.quantityAvailable - a.quantityAvailable);
      default: return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [activeListings, search, category, district, grade, sortBy, minPrice, maxPrice]);

  const hasActiveFilters = !!(search || category || district || grade || minPrice || maxPrice);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDistrict('');
    setGrade('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div>
      <PageHeader
        title="Produce Marketplace"
        subtitle="Browse available produce from farmers across Dakshina Kannada and Udupi"
        actions={
          user?.role === 'buyer' ? (
            <Link to="/buyer/requirements/new">
              <Button size="sm">Post Requirement</Button>
            </Link>
          ) : user?.role === 'farmer' ? (
            <Link to="/farmer/listings/new">
              <Button size="sm">List Produce</Button>
            </Link>
          ) : null
        }
      />

      {/* Demo notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2">
        <span className="text-amber-600 text-sm flex-shrink-0">🔬</span>
        <p className="text-xs text-amber-800">
          <strong>Demo Data</strong> — These are seeded demonstration listings, not real market offers.
          Seller asking prices are independent of market reference prices shown on the{' '}
          <Link to="/prices" className="underline">Prices page</Link>.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop, farmer, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Search listings"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(o => !o)}
              className={`flex items-center gap-2 text-sm px-3 py-2 border rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-green-600 text-white rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2"
                aria-label="Clear filters"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {DISTRICT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {GRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min ₹</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max ₹</label>
                <input
                  type="number"
                  placeholder="999"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
        {hasActiveFilters && ` matching your filters`}
      </p>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="No listings found"
          description={hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'No active listings at the moment.'}
          action={hasActiveFilters ? (
            <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
          ) : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <div
              key={listing.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Category header */}
              <div className="h-1.5 bg-green-600" />

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 text-sm leading-tight">{listing.productName}</h2>
                    {listing.variety && (
                      <p className="text-xs text-gray-500">{listing.variety}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{listing.productCategory ? categoryLabel(listing.productCategory) : ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${gradeColor(listing.grade)}`}>
                    Grade {listing.grade}
                  </span>
                </div>

                {/* Farmer & Location */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {listing.farmerName?.slice(0, 1)}
                  </div>
                  <span className="truncate">{listing.farmerName}</span>
                  <span className="text-gray-300">·</span>
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{listing.village}, {listing.taluk}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Scale size={10} /> Available
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {listing.quantityAvailable} {listing.unit}
                    </p>
                    {listing.quantityReserved > 0 && (
                      <p className="text-xs text-amber-600">{listing.quantityReserved} reserved</p>
                    )}
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Asking Price</p>
                    <p className="text-sm font-bold text-green-700 mt-0.5">
                      {formatINR(listing.askingPricePerUnit)}/{listing.unit}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Calendar size={11} />
                  <span>Available from {formatDate(listing.availableFrom)}</span>
                  {listing.availableUntil && <span>· until {formatDate(listing.availableUntil)}</span>}
                </div>

                {listing.notes && (
                  <p className="text-xs text-gray-600 italic bg-gray-50 rounded-lg p-2 mb-3 line-clamp-2">
                    "{listing.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {user?.role === 'buyer' && (
                    <Link to="/buyer/requirements/new" className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Post Requirement
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'farmer' && user.id === listing.farmerId && (
                    <Link to={`/farmer/listings/${listing.id}/edit`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Edit Listing
                      </Button>
                    </Link>
                  )}
                  {!user && (
                    <Link to="/register?role=buyer" className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Register to Buy
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
