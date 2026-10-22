// ============================================================
// HARVESTLINK - New/Edit Listing Form
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Input, Select, Textarea, Button, Alert } from '../../components/ui';
import type { Grade } from '../../types';

const GRADE_OPTIONS = [
  { value: 'premium', label: 'Premium' },
  { value: 'organic', label: 'Organic' },
  { value: 'A', label: 'Grade A' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' },
  { value: 'mixed', label: 'Mixed' },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'quintal', label: 'Quintal' },
  { value: 'tonne', label: 'Tonne' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'dozen', label: 'Dozen' },
];

export default function ListingFormPage() {
  const { user } = useAuth();
  const { products, listings, addListing, updateListing } = useDataStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const existingListing = id ? listings.find(l => l.id === id) : null;

  // Authorization check
  if (isEdit && existingListing && existingListing.farmerId !== user?.id) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-semibold">You are not authorized to edit this listing.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    productId: existingListing?.productId ?? '',
    variety: existingListing?.variety ?? '',
    quantityTotal: existingListing?.quantityTotal?.toString() ?? '',
    unit: existingListing?.unit ?? 'kg',
    grade: existingListing?.grade ?? 'A',
    askingPricePerUnit: existingListing?.askingPricePerUnit?.toString() ?? '',
    minimumQuantity: existingListing?.minimumQuantity?.toString() ?? '',
    availableFrom: existingListing?.availableFrom ?? today,
    availableUntil: existingListing?.availableUntil ?? '',
    village: existingListing?.village ?? user?.village ?? '',
    taluk: existingListing?.taluk ?? user?.taluk ?? '',
    district: existingListing?.district ?? user?.district ?? '',
    notes: existingListing?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProducts = products.filter(p => p.active);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.productId) e.productId = 'Select a product';
    if (!form.quantityTotal || parseFloat(form.quantityTotal) <= 0) e.quantityTotal = 'Enter a positive quantity';
    if (!form.askingPricePerUnit || parseFloat(form.askingPricePerUnit) <= 0) e.askingPricePerUnit = 'Enter a positive price';
    if (!form.minimumQuantity || parseFloat(form.minimumQuantity) <= 0) e.minimumQuantity = 'Enter a positive minimum';
    if (parseFloat(form.minimumQuantity) > parseFloat(form.quantityTotal)) e.minimumQuantity = 'Minimum cannot exceed total quantity';
    if (!form.availableFrom) e.availableFrom = 'Select availability start';
    if (!form.village) e.village = 'Enter village name';
    if (!form.taluk) e.taluk = 'Enter taluk';
    return e;
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    try {
      const qty = parseFloat(form.quantityTotal);
      const data = {
        farmerId: user!.id,
        farmerName: user!.displayName,
        productId: form.productId,
        variety: form.variety || undefined,
        quantityTotal: qty,
        quantityAvailable: isEdit ? (existingListing!.quantityAvailable) : qty,
        quantityReserved: isEdit ? (existingListing!.quantityReserved) : 0,
        unit: form.unit,
        grade: form.grade as Grade,
        askingPricePerUnit: parseFloat(form.askingPricePerUnit),
        minimumQuantity: parseFloat(form.minimumQuantity),
        availableFrom: form.availableFrom,
        availableUntil: form.availableUntil || undefined,
        village: form.village,
        taluk: form.taluk,
        district: form.district,
        notes: form.notes || undefined,
        status: 'active' as const,
      };

      if (isEdit && id) {
        updateListing(id, data);
      } else {
        addListing(data);
      }
      navigate('/farmer/listings');
    } catch {
      setSubmitError('Failed to save listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit Listing' : 'New Produce Listing'}
        subtitle={isEdit ? 'Update your listing details' : 'List your produce to connect with buyers'}
        breadcrumb={[
          { label: 'My Listings', href: '/farmer/listings' },
          { label: isEdit ? 'Edit' : 'New Listing' },
        ]}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {submitError && <Alert type="error" message={submitError} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Crop / Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop / Product <span className="text-red-500">*</span>
            </label>
            <select
              value={form.productId}
              onChange={e => update('productId', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.productId ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select crop...</option>
              {activeProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
          </div>

          <Input label="Variety (optional)" id="variety" value={form.variety} onChange={e => update('variety', e.target.value)}
            placeholder="e.g., Robusta, Nendran, West Coast Tall" hint="Specify the variety if applicable" />

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Quantity" id="qty" type="number" min="0.1" step="0.1"
              value={form.quantityTotal} onChange={e => update('quantityTotal', e.target.value)}
              required error={errors.quantityTotal} placeholder="e.g., 150" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={e => update('unit', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade <span className="text-red-500">*</span></label>
            <select value={form.grade} onChange={e => update('grade', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          {/* Price + Minimum */}
          <div className="grid grid-cols-2 gap-4">
            <Input label={`Asking Price (₹ per ${form.unit})`} id="price" type="number" min="0.01" step="0.01"
              value={form.askingPricePerUnit} onChange={e => update('askingPricePerUnit', e.target.value)}
              required error={errors.askingPricePerUnit} placeholder="e.g., 28"
              hint="Your asking price. Buyers may negotiate." />
            <Input label={`Min Order (${form.unit})`} id="min-qty" type="number" min="0.1" step="0.1"
              value={form.minimumQuantity} onChange={e => update('minimumQuantity', e.target.value)}
              required error={errors.minimumQuantity} placeholder="e.g., 50"
              hint="Minimum you'll sell at once" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Available From" id="from" type="date" value={form.availableFrom}
              onChange={e => update('availableFrom', e.target.value)} required error={errors.availableFrom}
              min={today} />
            <Input label="Available Until (optional)" id="until" type="date" value={form.availableUntil}
              onChange={e => update('availableUntil', e.target.value)}
              min={form.availableFrom || today} hint="Leave blank if ongoing" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Village" id="village" value={form.village}
              onChange={e => update('village', e.target.value)} required error={errors.village}
              placeholder="e.g., Niddodi" />
            <Input label="Taluk" id="taluk" value={form.taluk}
              onChange={e => update('taluk', e.target.value)} required error={errors.taluk}
              placeholder="e.g., Puttur" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select value={form.district} onChange={e => update('district', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">Select district</option>
              <option value="Dakshina Kannada">Dakshina Kannada</option>
              <option value="Udupi">Udupi</option>
              <option value="Uttara Kannada">Uttara Kannada</option>
            </select>
          </div>

          <Textarea label="Notes (optional)" id="notes" value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Describe your produce — farming practices, freshness, special characteristics..."
            hint="Good notes help buyers make confident decisions" />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {isEdit ? 'Update Listing' : 'Publish Listing'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/farmer/listings')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
