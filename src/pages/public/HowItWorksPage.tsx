// ============================================================
// HARVESTLINK - How It Works Page
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Leaf, Users, TrendingUp, Package, Shield, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">How HARVESTLINK Works</h1>
        <p className="text-gray-600 text-sm">From farm listing to confirmed order — every step explained.</p>
      </div>

      {/* Farmer Journey */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center"><Leaf size={16} className="text-white" /></div>
          <h2 className="text-lg font-bold text-gray-900">For Farmers</h2>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Role: Farmer</span>
        </div>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Create a profile', desc: 'Add your name, village, taluk, district, and contact information. Your profile helps buyers understand where you are located.' },
            { step: '2', title: 'List your produce', desc: 'For each crop you have available, set the quantity, unit, grade, asking price per unit, minimum order quantity, and availability dates.' },
            { step: '3', title: 'Receive matched demand', desc: 'The Demand Radar shows buyer requirements that match your listed produce — same crop, compatible grade, overlapping dates, and your location.' },
            { step: '4', title: 'Review proposals', desc: 'When a buyer creates an order proposal that includes your listing, you receive a proposal showing exactly how much they want from you and at what price.' },
            { step: '5', title: 'Accept or reject', desc: 'You decide independently whether to accept your contribution. No pressure. Your acceptance is binding only for your portion.' },
            { step: '6', title: 'Fulfil and complete', desc: 'On acceptance, your quantity is confirmed. You coordinate dispatch or pickup as agreed, and update the fulfilment status.' },
          ].map(s => (
            <div key={s.step} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
              <div><p className="font-semibold text-gray-900 text-sm mb-0.5">{s.title}</p><p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer Journey */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center"><Package size={16} className="text-white" /></div>
          <h2 className="text-lg font-bold text-gray-900">For Buyers</h2>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Role: Buyer</span>
        </div>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Post a requirement', desc: 'Specify the crop, quantity, unit, grade requirement, target price (optional), delivery location, and delivery window.' },
            { step: '2', title: 'Browse marketplace', desc: 'Search and filter active listings by crop, location, grade, price range, and availability.' },
            { step: '3', title: 'View matched supply', desc: 'The system shows compatible listings and calculates collective supply combinations when no single farmer can meet your full requirement.' },
            { step: '4', title: 'Propose a collective order', desc: 'Select a supply plan. Review each farmer\'s contribution, unit price, and the estimated subtotal. Submit a proposal to the selected farmers.' },
            { step: '5', title: 'Wait for farmer approvals', desc: 'Each farmer reviews and accepts or rejects their contribution independently. You can track acceptance status in real time.' },
            { step: '6', title: 'Order confirmed and fulfilled', desc: 'Once all participating farmers accept, the order is confirmed. Track dispatch and delivery status through to completion.' },
          ].map(s => (
            <div key={s.step} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
              <div><p className="font-semibold text-gray-900 text-sm mb-0.5">{s.title}</p><p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Collective Order Assembly Deep Dive */}
      <section className="mb-10 bg-green-50 border border-green-100 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Collective Order Assembly — How It Works</h2>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          When a buyer needs more than any single farmer can supply, HARVESTLINK runs a deterministic
          matching algorithm to find combinations of farmers whose combined supply meets the requirement.
        </p>
        <div className="space-y-2 text-xs text-gray-700">
          {[
            'Filter out inactive, expired, or incompatible listings (wrong crop, grade, unit, timing)',
            'Normalize quantities to the buyer\'s requested unit',
            'Rank eligible listings by match score: crop fit, grade, quantity contribution, location, price',
            'Greedily select listings in ranked order until requirement is met or all eligible listings are used',
            'Show the resulting supply plan with each farmer\'s contribution, price, and line total',
            'Label shortfalls clearly when combined supply is insufficient',
            'Buyer reviews the plan and submits a proposal — farmers approve independently',
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-2"><CheckCircle2 size={13} className="text-green-600 flex-shrink-0 mt-0.5" />{p}</div>
          ))}
        </div>
        <div className="mt-4 bg-white rounded-xl p-4 border border-green-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Key Rules</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Each farmer approves only their own contribution</li>
            <li>• No prices or quantities are changed without new consent</li>
            <li>• A farmer's rejection does not affect other farmers' agreements</li>
            <li>• Inventory is reserved after proposal, confirmed after acceptance</li>
            <li>• All changes are logged in an audit trail</li>
          </ul>
        </div>
      </section>

      {/* Price References */}
      <section className="mb-10 bg-amber-50 border border-amber-100 rounded-xl p-5">
        <h2 className="text-base font-bold text-gray-900 mb-2">Market Price References</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          HARVESTLINK shows reference prices from APMC mandis alongside seller listing prices.
          These are clearly labelled as reference data — not live feeds. Actual prices vary by grade,
          freshness, location, season, and transport costs.
        </p>
        <p className="text-xs text-amber-700 mt-2 font-medium">
          ⚠ Always verify prices with your local APMC and trading partners before committing.
        </p>
      </section>

      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register?role=farmer"><Button size="lg">Register as Farmer <ArrowRight size={15} /></Button></Link>
          <Link to="/register?role=buyer"><Button size="lg" variant="secondary">Register as Buyer <ArrowRight size={15} /></Button></Link>
        </div>
      </div>
    </div>
  );
}
