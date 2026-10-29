import { useState, useEffect, useMemo } from 'react';
import { getMyUniversity, updateMyUniversity } from '../../services/universityService';
import { Building, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import ProfileCompletionBar from '../../components/common/ProfileCompletionBar';
import { getUniversityCompletion } from '../../utils/profileCompletion';
import DeepProfileSections from './DeepProfileSections';
import { buildDeepFormState } from './deepProfileConfig';

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'deep', label: 'Detailed Profile' },
];

const UniversityProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    country: '',
    location: '',
    description: '',
    logo: '',
    website: '',
    ranking: '',
    establishedYear: '',
    campusType: 'Urban',
    totalStudents: '10,000+',
    history: '',
    campusLife: '',
    facilities: '',
    images: '',
    admissionRequirements: '',
  });
  const [deepForm, setDeepForm] = useState(buildDeepFormState(null));
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const universityData = await getMyUniversity();
        setProfile(universityData);
        setForm({
          name: universityData.name || '',
          country: universityData.country || '',
          location: universityData.location || '',
          description: universityData.description || '',
          logo: universityData.logo || '',
          website: universityData.website || '',
          ranking: universityData.ranking || '',
          establishedYear: universityData.establishedYear || '',
          campusType: universityData.campusType || 'Urban',
          totalStudents: universityData.totalStudents || '10,000+',
          history: universityData.history || '',
          campusLife: universityData.campusLife || '',
          facilities: (universityData.facilities || []).join(', '),
          images: (universityData.images || []).join(', '),
          admissionRequirements: (universityData.admissionRequirements || []).join(', '),
        });
        setDeepForm(buildDeepFormState(universityData));
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const completion = useMemo(() => getUniversityCompletion(profile), [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.country.trim() || !form.location.trim()) {
      setError('University Name, Country, and Location are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        ranking: form.ranking ? Number(form.ranking) : null,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : null,
        facilities: form.facilities.split(',').map(s => s.trim()).filter(Boolean),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        admissionRequirements: form.admissionRequirements.split(',').map(s => s.trim()).filter(Boolean),
        ...deepForm,
      };

      const updated = await updateMyUniversity(payload);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <ProfileCompletionBar percent={completion.percent} missing={completion.missing} />

      {/* Status Badge */}
      {profile && (
        <div className="bg-white p-4 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shrink-0">
            <Building className="text-primary-600" size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{profile.name}</p>
            <p className="text-sm text-ink-500 truncate">{profile.location}, {profile.country}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-ink-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-secondary-50 border border-secondary-200 text-secondary-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <CheckCircle className="mt-0.5 shrink-0" size={16} />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'basic' && (
        <>
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="uni-profile-name" className="block text-ink-500 text-sm font-semibold mb-1">University Name <span className="text-rose-500">*</span></label>
              <input
              id="uni-profile-name"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="University Name"
                required
              />
            </div>
            <div>
              <label htmlFor="uni-profile-country" className="block text-ink-500 text-sm font-semibold mb-1">Country <span className="text-rose-500">*</span></label>
              <input
              id="uni-profile-country"
                className="form-input"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Country"
                required
              />
            </div>
            <div>
              <label htmlFor="uni-profile-location" className="block text-ink-500 text-sm font-semibold mb-1">Location/City <span className="text-rose-500">*</span></label>
              <input
              id="uni-profile-location"
                className="form-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div>
              <label htmlFor="uni-profile-website" className="block text-ink-500 text-sm font-semibold mb-1">Website</label>
              <input
              id="uni-profile-website"
                className="form-input"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="uni-profile-ranking" className="block text-ink-500 text-sm font-semibold mb-1">Ranking</label>
              <input
              id="uni-profile-ranking"
                type="number"
                className="form-input"
                value={form.ranking}
                onChange={(e) => setForm({ ...form, ranking: e.target.value })}
                placeholder="1"
              />
            </div>
            <div>
              <label htmlFor="uni-profile-established" className="block text-ink-500 text-sm font-semibold mb-1">Established Year</label>
              <input
              id="uni-profile-established"
                type="number"
                className="form-input"
                value={form.establishedYear}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                placeholder="1900"
              />
            </div>
            <div>
              <label htmlFor="uni-profile-campus-type" className="block text-ink-500 text-sm font-semibold mb-1">Campus Type</label>
              <select
              id="uni-profile-campus-type"
                className="form-input"
                value={form.campusType}
                onChange={(e) => setForm({ ...form, campusType: e.target.value })}
              >
                <option value="Urban">Urban</option>
                <option value="Suburban">Suburban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
            <div>
              <label htmlFor="uni-profile-total-students" className="block text-ink-500 text-sm font-semibold mb-1">Total Students</label>
              <input
              id="uni-profile-total-students"
                className="form-input"
                value={form.totalStudents}
                onChange={(e) => setForm({ ...form, totalStudents: e.target.value })}
                placeholder="10,000+"
              />
            </div>
          </div>
          <div>
            <label htmlFor="uni-profile-logo" className="block text-ink-500 text-sm font-semibold mb-1">Logo URL</label>
            <input
              id="uni-profile-logo"
              className="form-input"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label htmlFor="uni-profile-description" className="block text-ink-500 text-sm font-semibold mb-1">Description</label>
            <textarea
              id="uni-profile-description"
              className="form-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="University description"
            />
          </div>
        </div>

        {/* Detailed Information */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900 mb-4">Detailed Information</h2>
          <div>
            <label htmlFor="uni-profile-history" className="block text-ink-500 text-sm font-semibold mb-1">History</label>
            <textarea
              id="uni-profile-history"
              className="form-input"
              rows={3}
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              placeholder="University history"
            />
          </div>
          <div>
            <label htmlFor="uni-profile-campus-life" className="block text-ink-500 text-sm font-semibold mb-1">Campus Life</label>
            <textarea
              id="uni-profile-campus-life"
              className="form-input"
              rows={3}
              value={form.campusLife}
              onChange={(e) => setForm({ ...form, campusLife: e.target.value })}
              placeholder="Campus life description"
            />
          </div>
          <div>
            <label htmlFor="uni-profile-facilities" className="block text-ink-500 text-sm font-semibold mb-1">Facilities (comma separated)</label>
            <input
              id="uni-profile-facilities"
              className="form-input"
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
              placeholder="Library, Gym, Cafeteria"
            />
          </div>
          <div>
            <label htmlFor="uni-profile-images" className="block text-ink-500 text-sm font-semibold mb-1">Images (comma separated URLs)</label>
            <input
              id="uni-profile-images"
              className="form-input"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
          </div>
          <div>
            <label htmlFor="uni-profile-admission-reqs" className="block text-ink-500 text-sm font-semibold mb-1">Admission Requirements (comma separated)</label>
            <input
              id="uni-profile-admission-reqs"
              className="form-input"
              value={form.admissionRequirements}
              onChange={(e) => setForm({ ...form, admissionRequirements: e.target.value })}
              placeholder="High School Diploma, Transcripts, IELTS"
            />
          </div>
        </div>
        </>
        )}

        {activeTab === 'deep' && (
          <DeepProfileSections deepForm={deepForm} setDeepForm={setDeepForm} />
        )}

        <Button
          type="submit"
          disabled={saving}
          className="w-full py-3"
        >
          {saving ? 'Saving...' : 'Save Profile'}
          {!saving && <Save className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
};

export default UniversityProfile;
