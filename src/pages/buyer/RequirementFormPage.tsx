// ============================================================
// HARVESTLINK - New Requirement Form
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import { PageHeader, Input, Textarea, Button, Alert } from '../../components/ui';
import type { Grade } from '../../types';

export default function RequirementFormPage() {
  const { user } = useAuth();
  const { products, addRequirement } = useDataStore();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    productId: '',
    quantityRequired: '',
    unit: 'kg',
    gradeRequired: '',
    targetPricePerUnit: '',
    deliveryLocation: user?.village ?? '',
    deliveryWindowStart: today,
    deliveryWindowEnd: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (f: string, v: string) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.productId) e.productId = 'Select a product';
    if (!form.quantityRequired || parseFloat(form.quantityRequired) <= 0) e.quantityRequired = 'Enter a positive quantity';
    if (!form.deliveryLocation) e.deliveryLocation = 'Enter delivery location';
    if (!form.deliveryWindowStart) e.deliveryWindowStart = 'Enter delivery start date';
    if (!form.deliveryWindowEnd) e.deliveryWindowEnd = 'Enter delivery end date';
    if (form.deliveryWindowEnd && form.deliveryWindowStart && form.deliveryWindowEnd < form.deliveryWindowStart)
      e.deliveryWindowEnd = 'End date must be after start date';
    if (form.targetPricePerUnit && parseFloat(form.targetPricePerUnit) <= 0)
      e.targetPricePerUnit = 'Enter a positive target price or leave blank';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      const req = addRequirement({
        buyerId: user!.id,
        buyerName: user!.displayName,
        productId: form.productId,
        quantityRequired: parseFloat(form.quantityRequired),
        unit: form.unit,
        gradeRequired: form.gradeRequired ? (form.gradeRequired as Grade) : undefined,
        targetPricePerUnit: form.targetPricePerUnit ? parseFloat(form.targetPricePerUnit) : undefined,
        deliveryLocation: form.deliveryLocation,
        deliveryWindowStart: form.deliveryWindowStart,
        deliveryWindowEnd: form.deliveryWindowEnd,
        notes: form.notes || undefined,
        status: 'open',
      });
      navigate(`/buyer/matches/${req.id}`);
    } catch {
      setSubmitError('Failed to post requirement. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Post a Requirement"
        subtitle="Tell farmers what you need — they'll see it in their Demand Radar"
        breadcrumb={[{ label: 'My Requirements', href: '/buyer/requirements' }, { label: 'New Requirement' }]}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {submitError && <Alert type="error" message={submitError} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop / Product <span className="text-red-500">*</span></label>
            <select value={form.productId} onChange={e => update('productId', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.productId ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">Select crop...</option>
              {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity Required" id="req-qty" type="number" min="0.1" step="0.1"
              value={form.quantityRequired} onChange={e => update('quantityRequired', e.target.value)}
              required error={errors.quantityRequired} placeholder="e.g., 500" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={e => update('unit', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="kg">Kilogram (kg)</option>
                <option value="quintal">Quintal</option>
                <option value="tonne">Tonne</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>
          </div>

          {/* Grade + Target Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Required (optional)</label>
              <select value={form.gradeRequired} onChange={e => update('gradeRequired', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Any grade</option>
                <option value="premium">Premium</option>
                <option value="organic">Organic</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <Input label="Target Price ₹/unit (optional)" id="req-price" type="number" min="0.01" step="0.01"
              value={form.targetPricePerUnit} onChange={e => update('targetPricePerUnit', e.target.value)}
              error={errors.targetPricePerUnit} placeholder="e.g., 30"
              hint="Leave blank if price is open" />
          </div>

          <Input label="Delivery Location" id="req-loc" value={form.deliveryLocation}
            onChange={e => update('deliveryLocation', e.target.value)} required
            error={errors.deliveryLocation} placeholder="e.g., Mangalore City, Udupi Town" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Delivery From" id="req-dstart" type="date" value={form.deliveryWindowStart}
              onChange={e => update('deliveryWindowStart', e.target.value)} required
              error={errors.deliveryWindowStart} min={today} />
            <Input label="Delivery By" id="req-dend" type="date" value={form.deliveryWindowEnd}
              onChange={e => update('deliveryWindowEnd', e.target.value)} required
              error={errors.deliveryWindowEnd} min={form.deliveryWindowStart || today} />
          </div>

          <Textarea label="Notes (optional)" id="req-notes" value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Describe quality expectations, frequency of supply, preferred contact method..."
            hint="Good notes help farmers assess fit" />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Post Requirement & Find Matches
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/buyer/requirements')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
