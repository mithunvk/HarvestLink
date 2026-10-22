// ============================================================
// HARVESTLINK - Home Page
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, ArrowRight, Users, TrendingUp, Package, Shield,
  CheckCircle2, Store, Smartphone, BarChart3, MapPin, ChevronRight
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { DEMO_LISTINGS, DEMO_PRICE_REFERENCES } from '../../data/demoData';
import { formatINR, formatDate, categoryLabel } from '../../lib/utils';

const features = [
  {
    icon: <Store size={22} className="text-green-600" />,
    title: 'Produce Marketplace',
    desc: 'Browse active listings from farmers across Dakshina Kannada and Udupi districts.',
  },
  {
    icon: <TrendingUp size={22} className="text-green-600" />,
    title: 'Market Price Intelligence',
    desc: 'Reference prices from APMC mandis. Know what the market is paying before you decide.',
  },
  {
    icon: <Users size={22} className="text-green-600" />,
    title: 'Collective Order Assembly',
    desc: 'When no single farmer can supply a buyer\'s full requirement, the platform finds a compatible combination.',
  },
  {
    icon: <Shield size={22} className="text-green-600" />,
    title: 'Consent-First Transactions',
    desc: 'No prices, quantities, or terms are changed without your explicit approval. Each farmer approves independently.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Farmers list produce',
    desc: 'Set quantity, grade, asking price, harvest date, and location.',
    role: 'farmer',
  },
  {
    step: '02',
    title: 'Buyers post requirements',
    desc: 'Specify crop, quantity, quality, delivery window, and target price.',
    role: 'buyer',
  },
  {
    step: '03',
    title: 'Demand Radar matches',
    desc: 'The system finds compatible listings using crop, grade, quantity, timing, and location.',
    role: 'system',
  },
  {
    step: '04',
    title: 'Collective plan assembled',
    desc: 'Multiple farmers can combine supply to meet large requirements.',
    role: 'system',
  },
  {
    step: '05',
    title: 'Farmers approve or reject',
    desc: 'Each farmer independently reviews and accepts or rejects their contribution.',
    role: 'farmer',
  },
  {
    step: '06',
    title: 'Order confirmed & fulfilled',
    desc: 'Confirmed orders are tracked through dispatch to delivery and completion.',
    role: 'both',
  },
];

export default function HomePage() {
  const sampleListings = DEMO_LISTINGS.filter(l => l.status === 'active').slice(0, 3);
  const samplePrices = DEMO_PRICE_REFERENCES.slice(0, 4);

  return (
    <div className="space-y-0">
      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative px-6 py-14 sm:py-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm mb-6">
            <Leaf size={14} />
            <span>Dakshina Kannada & Udupi, Karnataka</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
            Better markets.<br />Fairer harvests.
          </h1>
          <p className="text-green-100 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            HARVESTLINK connects marginal farmers directly with buyers — retailers, restaurants, wholesalers, and institutions.
            Transparent pricing. Collective supply. Every farmer's consent respected.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register?role=farmer">
              <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 w-full sm:w-auto">
                I'm a Farmer
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/register?role=buyer">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                I'm a Buyer
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Farmers', value: '5', sub: 'Demo accounts' },
          { label: 'Crop Listings', value: '8', sub: 'Active listings' },
          { label: 'Buyer Requirements', value: '4', sub: 'Open requests' },
          { label: 'Districts Covered', value: '2', sub: 'DK & Udupi' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-700">{stat.value}</p>
            <p className="text-xs font-medium text-gray-700">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* ===== FEATURES ===== */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">What HARVESTLINK Does</h2>
          <p className="text-sm text-gray-500 mt-1">A practical platform for local agricultural trade</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COLLECTIVE ORDER ASSEMBLY EXPLAINER ===== */}
      <section className="mb-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6 sm:p-8">
        <div className="max-w-2xl">
          <Badge className="mb-3 bg-green-100 text-green-700">Core Feature</Badge>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Collective Order Assembly</h2>
          <p className="text-sm text-gray-700 mb-5 leading-relaxed">
            Sometimes a buyer needs more than any single farmer can supply.
            HARVESTLINK automatically identifies compatible combinations of farmers
            whose combined supply meets the requirement — with each farmer's explicit consent.
          </p>

          {/* Demo Example */}
          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              📋 Demo Example (Illustration Only)
            </p>
            <p className="text-sm font-medium text-gray-800 mb-3">
              Buyer needs <strong>500 kg Banana (Robusta)</strong>
            </p>
            <div className="space-y-2 mb-4">
              {[
                { farmer: 'Suresh Kumar Shetty', location: 'Niddodi, Puttur', qty: 150, price: 28, grade: 'A' },
                { farmer: 'Laxmi Devadiga', location: 'Kalladka, Bantwal', qty: 200, price: 27, grade: 'A' },
                { farmer: 'Ramesh Poojary', location: 'Moodbidri', qty: 150, price: 25, grade: 'B' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{p.farmer}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={10} />{p.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-700">{p.qty} kg</p>
                    <p className="text-xs text-gray-500">@ {formatINR(p.price)}/kg · Grade {p.grade}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-green-700 text-white rounded-lg px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-xs opacity-75">Combined supply</p>
                <p className="font-bold">500 kg ✓ Requirement met</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Estimated subtotal</p>
                <p className="font-bold">₹13,350</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚠ Demo values only. Each farmer must independently approve before an order is confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SAMPLE LISTINGS ===== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Produce Listings</h2>
            <p className="text-xs text-gray-500 mt-0.5">Demo data · Not live market listings</p>
          </div>
          <Link to="/marketplace" className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{listing.productName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />{listing.village}, {listing.taluk}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Grade {listing.grade}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Available</p>
                  <p className="font-semibold text-gray-800">{listing.quantityAvailable} {listing.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">Asking Price</p>
                  <p className="font-semibold text-green-700">{formatINR(listing.askingPricePerUnit)}/{listing.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">Farmer</p>
                  <p className="font-medium text-gray-800 truncate">{listing.farmerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Available From</p>
                  <p className="font-medium text-gray-800">{formatDate(listing.availableFrom)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICE REFERENCE STRIP ===== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Market Price References</h2>
            <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-0.5 mt-1 inline-block">
              🔬 Demo reference data — Not live mandi prices
            </p>
          </div>
          <Link to="/prices" className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1">
            Full Table <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {samplePrices.map(price => (
            <div key={price.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{price.productName}</h3>
              <p className="text-xs text-gray-500 mb-2">{price.marketName}</p>
              <div className="flex gap-2 text-xs">
                {price.minPrice && (
                  <div className="flex-1 bg-red-50 rounded p-1.5 text-center">
                    <p className="text-gray-500">Min</p>
                    <p className="font-bold text-gray-800">{formatINR(price.minPrice)}</p>
                  </div>
                )}
                {price.modalPrice && (
                  <div className="flex-1 bg-green-50 rounded p-1.5 text-center">
                    <p className="text-gray-500">Modal</p>
                    <p className="font-bold text-green-700">{formatINR(price.modalPrice)}</p>
                  </div>
                )}
                {price.maxPrice && (
                  <div className="flex-1 bg-blue-50 rounded p-1.5 text-center">
                    <p className="text-gray-500">Max</p>
                    <p className="font-bold text-gray-800">{formatINR(price.maxPrice)}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{price.unit} · {formatDate(price.observationDate)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
          <p className="text-sm text-gray-500 mt-1">From farm to buyer, step by step</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {howItWorks.map(step => (
            <div key={step.step} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {step.step}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                  {step.role === 'farmer' && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Farmer</span>
                  )}
                  {step.role === 'buyer' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Buyer</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link to="/how-it-works">
            <Button variant="secondary">
              Learn More <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== TRUST / SAFETY ===== */}
      <section className="mb-8 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Trust & Safety Principles</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Every farmer explicitly approves their own contribution, price, and quantity.',
            'No price or quantity is changed without consent. Full audit trail maintained.',
            'Proposals are not confirmed orders. Each acceptance step is tracked separately.',
            'Market reference prices are clearly labelled as reference data, not live mandi feeds.',
            'Contact details are never exposed to unrelated users.',
            'Inventory is reserved only after acceptance and verified server-side.',
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              {point}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl text-white p-8 sm:p-10 text-center mb-4">
        <Leaf size={28} className="mx-auto mb-3 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
        <p className="text-green-100 text-sm mb-6 max-w-md mx-auto">
          Join farmers and buyers across coastal Karnataka on HARVESTLINK.
          Better prices, direct connections, collective strength.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register?role=farmer">
            <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 w-full sm:w-auto">
              Register as Farmer
            </Button>
          </Link>
          <Link to="/register?role=buyer">
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
              Register as Buyer
            </Button>
          </Link>
        </div>
        <p className="text-xs text-green-200 mt-4">
          Use demo credentials to explore the platform without registration.
        </p>
      </section>
    </div>
  );
}
