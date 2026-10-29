import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import agentService from '../../services/agentService';
import uploadService from '../../services/uploadService';
import { Clock, AlertTriangle, CheckCircle, Save, Briefcase, Upload } from 'lucide-react';
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import ProfileCompletionBar from '../../components/common/ProfileCompletionBar';
import { getAgentCompletion } from '../../utils/profileCompletion';
import Button from '../../components/common/Button';

const AgentProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    phone: '',
    companyName: '',
    designation: '',
    experienceYears: '',
    specializedCountries: '',
    officeAddress: { street: '', city: '', state: '', country: '', zip: '' },
    bio: '',
    languagesSpoken: '',
    certifications: '',
    companyLogo: '',
    website: '',
    tradeLicenseNumber: '',
    tin: '',
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef(null);

  const completion = useMemo(() => getAgentCompletion({
    ...form,
    specializedCountries: form.specializedCountries.split(',').map((s) => s.trim()).filter(Boolean),
    languagesSpoken: form.languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
    certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean),
  }), [form]);

  useEffect(() => {
    agentService.getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          phone: data.phone || '',
          companyName: data.companyName || '',
          designation: data.designation || '',
          experienceYears: data.experienceYears ?? '',
          specializedCountries: (data.specializedCountries || []).join(', '),
          officeAddress: data.officeAddress || { street: '', city: '', state: '', country: '', zip: '' },
          bio: data.bio || '',
          languagesSpoken: (data.languagesSpoken || []).join(', '),
          certifications: (data.certifications || []).join(', '),
          companyLogo: data.companyLogo || '',
          website: data.website || '',
          tradeLicenseNumber: data.tradeLicenseNumber || '',
          tin: data.tin || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const result = await uploadService.uploadFile(file);
      setForm((f) => ({ ...f, companyLogo: result.url }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        phone: form.phone,
        companyName: form.companyName,
        designation: form.designation,
        experienceYears: form.experienceYears !== '' ? parseInt(form.experienceYears) : 0,
        specializedCountries: form.specializedCountries.split(',').map((s) => s.trim()).filter(Boolean),
        officeAddress: form.officeAddress,
        bio: form.bio,
        languagesSpoken: form.languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean),
        companyLogo: form.companyLogo,
        website: form.website,
        tradeLicenseNumber: form.tradeLicenseNumber,
        tin: form.tin,
      };
      const updated = await agentService.updateMyProfile(payload);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">

      <ProfileHeader user={user} updateUser={updateUser} />

      <ProfileCompletionBar percent={completion.percent} missing={completion.missing} />

      {/* Status Badge */}
      {profile && (
        <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 border border-secondary-200 flex items-center justify-center shrink-0">
              <Briefcase className="text-secondary-600" size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">Agent Status</p>
              <p className="text-sm text-ink-500 truncate">{profile.user?.email}</p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider shrink-0 ${profile.status === 'approved'
            ? 'bg-secondary-50 text-secondary-600 border-secondary-200'
            : profile.status === 'rejected'
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-accent-50 text-accent-600 border-accent-200'
            }`}>
            {profile.status}
          </span>
        </div>
      )}

      {/* Pending/rejected notice */}
      {profile?.status === 'rejected' && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm flex items-start gap-3 mb-6">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          <span>Your agent application was not approved, so profile changes are disabled. Please contact support if you believe this is a mistake.</span>
        </div>
      )}
      {profile?.status === 'pending' && (
        <div className="bg-accent-50 border border-accent-200 text-accent-600 p-4 rounded-xl text-sm flex items-start gap-3 mb-6">
          <Clock className="mt-0.5 shrink-0" size={16} />
          <span>Pending approval – changes not allowed.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-primary-50 border border-primary-200 text-primary-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <CheckCircle className="mt-0.5 shrink-0" size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Professional Info */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Professional Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agent-company" className="block text-ink-500 text-sm font-semibold mb-1">Company / Agency Name</label>
              <input id="agent-company" className="form-input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="XYZ Consultancy Ltd." />
            </div>
            <div>
              <label htmlFor="agent-designation" className="block text-ink-500 text-sm font-semibold mb-1">Designation</label>
              <input id="agent-designation" className="form-input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Senior Counselor" />
            </div>
            <div>
              <label htmlFor="agent-phone" className="block text-ink-500 text-sm font-semibold mb-1">Phone</label>
              <input id="agent-phone" type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
            </div>
            <div>
              <label htmlFor="agent-experience" className="block text-ink-500 text-sm font-semibold mb-1">Years of Experience</label>
              <input id="agent-experience" type="number" min="0" className="form-input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} placeholder="5" />
            </div>
          </div>
          <div>
            <label htmlFor="agent-countries" className="block text-ink-500 text-sm font-semibold mb-1">Specialized Countries (comma-separated)</label>
            <input id="agent-countries" className="form-input" value={form.specializedCountries} onChange={(e) => setForm({ ...form, specializedCountries: e.target.value })} placeholder="UK, Canada, Australia" />
          </div>
        </div>

        {/* Office Address */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Office Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="agent-street" className="block text-ink-500 text-sm font-semibold mb-1">Street</label>
              <input id="agent-street" className="form-input" value={form.officeAddress.street} onChange={(e) => setForm({ ...form, officeAddress: { ...form.officeAddress, street: e.target.value } })} placeholder="123 Business Ave" />
            </div>
            <div>
              <label htmlFor="agent-city" className="block text-ink-500 text-sm font-semibold mb-1">City</label>
              <input id="agent-city" className="form-input" value={form.officeAddress.city} onChange={(e) => setForm({ ...form, officeAddress: { ...form.officeAddress, city: e.target.value } })} placeholder="Dhaka" />
            </div>
            <div>
              <label htmlFor="agent-state" className="block text-ink-500 text-sm font-semibold mb-1">State</label>
              <input id="agent-state" className="form-input" value={form.officeAddress.state} onChange={(e) => setForm({ ...form, officeAddress: { ...form.officeAddress, state: e.target.value } })} placeholder="Dhaka" />
            </div>
            <div>
              <label htmlFor="agent-country" className="block text-ink-500 text-sm font-semibold mb-1">Country</label>
              <input id="agent-country" className="form-input" value={form.officeAddress.country} onChange={(e) => setForm({ ...form, officeAddress: { ...form.officeAddress, country: e.target.value } })} placeholder="Bangladesh" />
            </div>
            <div>
              <label htmlFor="agent-zip" className="block text-ink-500 text-sm font-semibold mb-1">ZIP</label>
              <input id="agent-zip" className="form-input" value={form.officeAddress.zip} onChange={(e) => setForm({ ...form, officeAddress: { ...form.officeAddress, zip: e.target.value } })} placeholder="1200" />
            </div>
          </div>
        </div>

        {/* Profile & Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Profile & Credentials</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-ink-200 bg-cream-50 flex items-center justify-center overflow-hidden shrink-0">
              {form.companyLogo ? (
                <img src={form.companyLogo} alt="Company logo" className="w-full h-full object-contain" />
              ) : (
                <Briefcase className="w-6 h-6 text-ink-400" />
              )}
            </div>
            <div>
              <p className="text-ink-500 text-sm font-semibold mb-1.5">Company Logo</p>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                {logoUploading ? 'Uploading...' : form.companyLogo ? 'Replace Logo' : 'Upload Logo'}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
          <div>
            <label htmlFor="agent-website" className="block text-ink-500 text-sm font-semibold mb-1">Website</label>
            <input id="agent-website" className="form-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" />
          </div>
          <div>
            <label htmlFor="agent-bio" className="block text-ink-500 text-sm font-semibold mb-1">Bio</label>
            <textarea id="agent-bio" rows={3} className="form-input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short introduction about you and your agency's track record." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agent-languages" className="block text-ink-500 text-sm font-semibold mb-1">Languages Spoken (comma-separated)</label>
              <input id="agent-languages" className="form-input" value={form.languagesSpoken} onChange={(e) => setForm({ ...form, languagesSpoken: e.target.value })} placeholder="English, Bengali, Hindi" />
            </div>
            <div>
              <label htmlFor="agent-certifications" className="block text-ink-500 text-sm font-semibold mb-1">Certifications (comma-separated)</label>
              <input id="agent-certifications" className="form-input" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="British Council Certified, PIER/QEAC Certified" />
            </div>
          </div>
        </div>

        {/* Business Verification */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Business Verification</h2>
          <p className="text-ink-500 text-xs -mt-2">Used by our team to verify your agency — kept private, never shown publicly.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agent-trade-license" className="block text-ink-500 text-sm font-semibold mb-1">Trade License Number</label>
              <input id="agent-trade-license" className="form-input" value={form.tradeLicenseNumber} onChange={(e) => setForm({ ...form, tradeLicenseNumber: e.target.value })} placeholder="TRAD/DNCC/123456/2024" />
            </div>
            <div>
              <label htmlFor="agent-tin" className="block text-ink-500 text-sm font-semibold mb-1">TIN (Tax Identification Number)</label>
              <input id="agent-tin" className="form-input" value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} placeholder="123456789012" />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || profile?.status !== 'approved'}
          className="w-full py-3"
        >
          {saving
            ? 'Saving...'
            : profile?.status === 'rejected'
              ? 'Not Approved'
              : profile?.status !== 'approved'
                ? 'Pending Approval'
                : 'Save Profile'}
          {!saving && profile?.status === 'approved' && <Save className="ml-2" size={16} />}
        </Button>
      </form>
    </div>
  );
};

export default AgentProfile;
