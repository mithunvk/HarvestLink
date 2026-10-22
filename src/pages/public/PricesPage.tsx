// ============================================================
// HARVESTLINK - Prices Page (Market Price Intelligence)
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Alert, Badge } from '../../components/ui';
import { formatINR, formatDate } from '../../lib/utils';
import { TrendingUp, Info, ExternalLink, ArrowUpDown } from 'lucide-react';

export default function PricesPage() {
  const { priceReferences, products, listings } = useDataStore();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const regions = useMemo(() => {
    const set = new Set(priceReferences.map(p => p.region));
    return Array.from(set);
  }, [priceReferences]);

  const filtered = useMemo(() => {
    let result = priceReferences;
    if (selectedProduct) result = result.filter(p => p.productId === selectedProduct);
    if (selectedRegion) result = result.filter(p => p.region === selectedRegion);
    return result.sort((a, b) => b.observationDate.localeCompare(a.observationDate));
  }, [priceReferences, selectedProduct, selectedRegion]);

  // Build comparison: seller asking price vs reference modal price
  const comparisons = useMemo(() => {
    return filtered.map(ref => {
      const activeListingsForProduct = listings.filter(
        l => l.productId === ref.productId && l.status === 'active'
      );
      const avgAskingPrice = activeListingsForProduct.length > 0
        ? activeListingsForProduct.reduce((sum, l) => sum + l.askingPricePerUnit, 0) / activeListingsForProduct.length
        : null;
      const spread = avgAskingPrice && ref.modalPrice
        ? ((avgAskingPrice - ref.modalPrice) / ref.modalPrice * 100).toFixed(1)
        : null;
      return { ref, avgAskingPrice, spread, listingsCount: activeListingsForProduct.length };
    });
  }, [filtered, listings]);

  return (
    <div>
      <PageHeader
        title="Market Price References"
        subtitle="Reference prices from APMC mandis for Dakshina Kannada and Udupi districts"
      />

      {/* Important disclaimer */}
      <Alert
        type="warning"
        title="Demo Reference Data"
        message="All prices shown are seeded demonstration values for illustrative purposes only. They are NOT live mandi data or official AGMARKNET feeds. Actual market prices vary by grade, quality, season, location, and transport costs. Always verify with your local APMC before making trading decisions."
        className="mb-5"
      />

      <Alert
        type="info"
        message="Price context, not promises: Market reference prices help you understand the broader market. They may differ significantly from farm-gate prices due to grade differences, harvest timing, transport distances, and other factors."
        className="mb-5"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Crop</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All Crops</option>
            {products.filter(p => p.active).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Region</label>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Price Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Reference Price Table</h2>
          <span className="text-xs text-gray-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Market price references">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Crop</th>
                <th className="text-left px-4 py-3 font-medium">Market</th>
                <th className="text-left px-4 py-3 font-medium">Region</th>
                <th className="text-right px-4 py-3 font-medium">Min</th>
                <th className="text-right px-4 py-3 font-medium">Modal</th>
                <th className="text-right px-4 py-3 font-medium">Max</th>
                <th className="text-left px-4 py-3 font-medium">Unit</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(price => (
                <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{price.productName}</td>
                  <td className="px-4 py-3 text-gray-700">{price.marketName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{price.region}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
                    {price.minPrice ? formatINR(price.minPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 font-bold">
                    {price.modalPrice ? formatINR(price.modalPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">
                    {price.maxPrice ? formatINR(price.maxPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">/{price.unit}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(price.observationDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">demo</span>
                      {price.sourceUrl && (
                        <a
                          href={price.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                          aria-label={`Visit ${price.sourceName}`}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison: Seller asking vs reference */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Seller Price vs Market Reference</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Compares average listing asking prices with modal market price. For context only.
          </p>
        </div>
        <div className="p-4">
          <Alert
            type="warning"
            message="This comparison is for orientation only. Seller prices may legitimately differ from reference prices due to grade, freshness, organic status, location, and transport costs. Do not use this as a negotiating benchmark without full context."
            className="mb-4"
          />
          <div className="space-y-3">
            {comparisons.filter(c => c.ref.modalPrice).map(({ ref, avgAskingPrice, spread, listingsCount }) => (
              <div key={ref.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ref.productName}</p>
                  <p className="text-xs text-gray-500">{ref.marketName} · {ref.region}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-500">Modal Ref</p>
                    <p className="text-sm font-bold text-green-700">{formatINR(ref.modalPrice!)}/{ref.unit}</p>
                  </div>
                  {avgAskingPrice !== null ? (
                    <div>
                      <p className="text-xs text-gray-500">Avg Asking ({listingsCount} listings)</p>
                      <p className="text-sm font-bold text-gray-800">{formatINR(avgAskingPrice)}/{ref.unit}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500">No active listings</p>
                      <p className="text-sm text-gray-400">—</p>
                    </div>
                  )}
                  {spread !== null && (
                    <div>
                      <p className="text-xs text-gray-500">Spread</p>
                      <p className={`text-sm font-bold ${parseFloat(spread) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                        {parseFloat(spread) > 0 ? '+' : ''}{spread}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data integration info */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
          <TrendingUp size={16} />
          About Data Integration
        </h3>
        <p className="text-xs text-green-800 leading-relaxed mb-3">
          HARVESTLINK is designed to connect with official price data sources such as{' '}
          <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            AGMARKNET
          </a>{' '}
          (Agricultural Marketing Information System) when the integration is configured.
          The data provider interface is replaceable — no scraping or brittle workarounds.
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-green-700">
          <div className="flex items-start gap-1.5">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            Current mode: <strong>Demo seeded data</strong>
          </div>
          <div className="flex items-start gap-1.5">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            Data type field indicates: official / imported / manual_admin / demo
          </div>
        </div>
      </div>
    </div>
  );
}
