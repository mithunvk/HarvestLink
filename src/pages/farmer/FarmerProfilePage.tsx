// ============================================================
// HARVESTLINK - Farmer Profile Page
// ============================================================
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Input, Button, Alert, Avatar } from '../../components/ui';

export default function FarmerProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    phone: user?.phone ?? '',
    village: user?.village ?? '',
    taluk: user?.taluk ?? '',
    district: user?.district ?? '',
    preferredLanguage: user?.preferredLanguage ?? 'en',
  });
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateProfile(form);
    setSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <PageHeader title="Profile Settings" subtitle="Update your farmer profile information" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <Avatar name={user.displayName} size="lg" />
          <div>
            <p className="font-semibold text-gray-900">{user.displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-block mt-1">Farmer</p>
          </div>
        </div>

        {success && <Alert type="success" message="Profile updated successfully." className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="pf-name" value={form.displayName} onChange={e => update('displayName', e.target.value)} required />
          <Input label="Phone Number" id="pf-phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
            placeholder="+91 98XXX XXXXX" hint="Used only for demo contact display — not publicly shown" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Village" id="pf-village" value={form.village} onChange={e => update('village', e.target.value)} />
            <Input label="Taluk" id="pf-taluk" value={form.taluk} onChange={e => update('taluk', e.target.value)} />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
            <select value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="tulu">Tulu</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">UI is currently English only. Kannada/Tulu translations are planned for a future release.</p>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isSaving} className="w-full">Save Profile</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
