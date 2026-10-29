import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import uploadService from '../../services/uploadService';
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import ProfileCompletionBar from '../../components/common/ProfileCompletionBar';
import { getStudentCompletion } from '../../utils/profileCompletion';
import { AlertTriangle, CheckCircle, Plus, Save, Trash2, FileText, Upload } from 'lucide-react';
import Button from '../../components/common/Button';

const DEGREE_LEVELS = ['Foundation', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD'];
const INTAKE_SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const BOARDS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Barisal', 'Sylhet', 'Mymensingh', 'Cumilla', 'Dinajpur', 'Jessore', 'Madrasah', 'Technical'];

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: { street: '', city: '', state: '', country: '', zip: '' },
    ieltsScore: '',
    desiredCountry: '',
    academicQualifications: [],
    resume: '',
    preferredCourses: '',
    studyPreferences: { degreeLevels: [], budget: '', intakeSeason: '', scholarshipAlerts: true },
    passportNumber: '',
    nidOrBirthCertNumber: '',
    board: '',
    guardian: { name: '', relation: '', occupation: '', phone: '' },
  });
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef(null);

  const completion = useMemo(() => getStudentCompletion({
    ...form,
    desiredCountry: form.desiredCountry.split(',').map((s) => s.trim()).filter(Boolean),
    preferredCourses: form.preferredCourses.split(',').map((s) => s.trim()).filter(Boolean),
    ieltsScore: form.ieltsScore !== '' ? parseFloat(form.ieltsScore) : null,
    studyPreferences: { ...form.studyPreferences, budget: form.studyPreferences.budget !== '' ? parseFloat(form.studyPreferences.budget) : null },
  }), [form]);

  const loadProfile = useCallback(() => {
    setLoading(true);
    setError('');
    return studentService
      .getMyStudentProfile()
      .then((p) => {
        setForm({
          phone: p.phone || '',
          gender: p.gender || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          address: p.address || { street: '', city: '', state: '', country: '', zip: '' },
          ieltsScore: p.ieltsScore ?? '',
          desiredCountry: (p.desiredCountry || []).join(', '),
          academicQualifications: p.academicQualifications || [],
          resume: p.resume || '',
          preferredCourses: (p.preferredCourses || []).join(', '),
          studyPreferences: {
            degreeLevels: p.studyPreferences?.degreeLevels || [],
            budget: p.studyPreferences?.budget ?? '',
            intakeSeason: p.studyPreferences?.intakeSeason || '',
            scholarshipAlerts: p.studyPreferences?.scholarshipAlerts ?? true,
          },
          passportNumber: p.passportNumber || '',
          nidOrBirthCertNumber: p.nidOrBirthCertNumber || '',
          board: p.board || '',
          guardian: p.guardian || { name: '', relation: '', occupation: '', phone: '' },
        });
      })
      .catch((err) => setError(err.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const result = await uploadService.uploadFile(file);
      setForm((f) => ({ ...f, resume: result.url }));
      toast.success('Resume uploaded');
    } catch {
      toast.error('Resume upload failed');
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const toggleDegreeLevel = (level) =>
    setForm((f) => ({
      ...f,
      studyPreferences: {
        ...f.studyPreferences,
        degreeLevels: f.studyPreferences.degreeLevels.includes(level)
          ? f.studyPreferences.degreeLevels.filter((l) => l !== level)
          : [...f.studyPreferences.degreeLevels, level],
      },
    }));

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address,
        ieltsScore: form.ieltsScore !== '' ? parseFloat(form.ieltsScore) : null,
        desiredCountry: form.desiredCountry.split(',').map((s) => s.trim()).filter(Boolean),
        academicQualifications: form.academicQualifications,
        resume: form.resume,
        preferredCourses: form.preferredCourses.split(',').map((s) => s.trim()).filter(Boolean),
        studyPreferences: {
          ...form.studyPreferences,
          budget: form.studyPreferences.budget !== '' ? parseFloat(form.studyPreferences.budget) : null,
        },
        passportNumber: form.passportNumber,
        nidOrBirthCertNumber: form.nidOrBirthCertNumber,
        board: form.board,
        guardian: form.guardian,
      };
      await studentService.updateMyStudentProfile(payload);
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const addQualification = () =>
    setForm((f) => ({
      ...f,
      academicQualifications: [
        ...f.academicQualifications,
        { level: '', institution: '', passingYear: '', cgpa: '' },
      ],
    }));

  const updateQualification = (idx, field, value) =>
    setForm((f) => ({
      ...f,
      academicQualifications: f.academicQualifications.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      ),
    }));

  const removeQualification = (idx) =>
    setForm((f) => ({
      ...f,
      academicQualifications: f.academicQualifications.filter((_, i) => i !== idx),
    }));

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

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={loadProfile} className="font-bold underline shrink-0">Retry</button>
          </div>
        )}
        {success && (
          <div className="bg-primary-50 border border-primary-200 text-primary-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <CheckCircle className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Phone</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Gender</label>
              <select className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Date of Birth</label>
              <input type="date" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">IELTS Score</label>
              <input type="number" min="0" max="9" step="0.5" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.ieltsScore} onChange={(e) => setForm({ ...form, ieltsScore: e.target.value })} placeholder="6.5" />
            </div>
          </div>
          <div>
            <label className="block text-ink-500 text-sm font-semibold mb-1">Preferred Countries (comma-separated)</label>
            <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.desiredCountry} onChange={(e) => setForm({ ...form, desiredCountry: e.target.value })} placeholder="UK, Canada, Australia" />
          </div>
          <div>
            <label className="block text-ink-500 text-sm font-semibold mb-1">Preferred Courses / Fields of Interest (comma-separated)</label>
            <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.preferredCourses} onChange={(e) => setForm({ ...form, preferredCourses: e.target.value })} placeholder="Computer Science, Business Administration" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-ink-500 text-sm font-semibold mb-1">Street</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} placeholder="123 Main Street" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">City</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} placeholder="Dhaka" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">State / Division</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} placeholder="Dhaka" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Country</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.address.country} onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })} placeholder="Bangladesh" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">ZIP / Postal Code</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.address.zip} onChange={(e) => setForm({ ...form, address: { ...form.address, zip: e.target.value } })} placeholder="1200" />
            </div>
          </div>
        </div>

        {/* Academic Qualifications */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink-900">Academic Qualifications</h2>
            <button type="button" onClick={addQualification} className="text-sm px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all">
              <Plus className="mr-1" />Add
            </button>
          </div>
          {form.academicQualifications.length === 0 && (
            <p className="text-ink-500 text-sm">No qualifications added yet.</p>
          )}
          {form.academicQualifications.map((q, idx) => (
            <div key={idx} className="bg-cream-50 border border-ink-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-500 font-bold uppercase tracking-wider">Entry #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQualification(idx)}
                  aria-label={`Remove qualification entry ${idx + 1}`}
                  className="text-ink-500 hover:text-rose-600 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-500 text-sm font-semibold mb-1">Level</label>
                  <select className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm" value={q.level} onChange={(e) => updateQualification(idx, 'level', e.target.value)}>
                    <option value="">Select</option>
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-500 text-sm font-semibold mb-1">CGPA</label>
                  <input type="number" step="0.01" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm" value={q.cgpa} onChange={(e) => updateQualification(idx, 'cgpa', e.target.value)} placeholder="3.80" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-ink-500 text-sm font-semibold mb-1">Institution</label>
                  <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm" value={q.institution} onChange={(e) => updateQualification(idx, 'institution', e.target.value)} placeholder="Name of School/University" />
                </div>
                <div>
                  <label className="block text-ink-500 text-sm font-semibold mb-1">Passing Year</label>
                  <input type="number" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm" value={q.passingYear} onChange={(e) => updateQualification(idx, 'passingYear', e.target.value)} placeholder="2022" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Identification & Guardian Details */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Identification & Guardian Details</h2>
          <p className="text-ink-500 text-xs -mt-2">Needed for visa and admission verification — kept private to you, your assigned agent, and admins.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Passport Number</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.passportNumber} onChange={(e) => setForm({ ...form, passportNumber: e.target.value })} placeholder="EC1234567" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">NID / Birth Certificate Number</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.nidOrBirthCertNumber} onChange={(e) => setForm({ ...form, nidOrBirthCertNumber: e.target.value })} placeholder="1234567890123" />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">SSC/HSC Board</label>
              <select className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })}>
                <option value="">Select</option>
                {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2 border-t border-ink-100">
            <p className="text-ink-700 text-sm font-bold mb-3">Guardian / Sponsor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-500 text-sm font-semibold mb-1">Name</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.guardian.name} onChange={(e) => setForm({ ...form, guardian: { ...form.guardian, name: e.target.value } })} placeholder="Guardian's full name" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-semibold mb-1">Relation</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.guardian.relation} onChange={(e) => setForm({ ...form, guardian: { ...form.guardian, relation: e.target.value } })} placeholder="Father / Mother / Uncle" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-semibold mb-1">Occupation</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.guardian.occupation} onChange={(e) => setForm({ ...form, guardian: { ...form.guardian, occupation: e.target.value } })} placeholder="Business / Service" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-semibold mb-1">Phone</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.guardian.phone} onChange={(e) => setForm({ ...form, guardian: { ...form.guardian, phone: e.target.value } })} placeholder="+880..." />
              </div>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
          <h2 className="font-bold text-ink-900">Study Preferences</h2>
          <div>
            <label className="block text-ink-500 text-sm font-semibold mb-2">Preferred Degree Levels</label>
            <div className="flex flex-wrap gap-2">
              {DEGREE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleDegreeLevel(level)}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all ${
                    form.studyPreferences.degreeLevels.includes(level)
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-ink-200 text-ink-600 hover:border-primary-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Budget (USD/year)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                value={form.studyPreferences.budget}
                onChange={(e) => setForm({ ...form, studyPreferences: { ...form.studyPreferences, budget: e.target.value } })}
                placeholder="20000"
              />
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-semibold mb-1">Intake Season</label>
              <select
                className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                value={form.studyPreferences.intakeSeason}
                onChange={(e) => setForm({ ...form, studyPreferences: { ...form.studyPreferences, intakeSeason: e.target.value } })}
              >
                <option value="">Select</option>
                {INTAKE_SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500/30"
              checked={form.studyPreferences.scholarshipAlerts}
              onChange={(e) => setForm({ ...form, studyPreferences: { ...form.studyPreferences, scholarshipAlerts: e.target.checked } })}
            />
            Notify me about new scholarship opportunities
          </label>
        </div>

        {/* Resume / CV */}
        <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-3">
          <h2 className="font-bold text-ink-900">Resume / CV</h2>
          {form.resume ? (
            <a
              href={form.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm font-semibold text-primary-600 hover:underline"
            >
              <FileText className="w-4 h-4 shrink-0" /> View uploaded resume
            </a>
          ) : (
            <p className="text-ink-500 text-sm">No resume uploaded yet.</p>
          )}
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={resumeUploading}
            className="inline-flex items-center gap-2 text-sm px-4 py-2.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {resumeUploading ? 'Uploading...' : form.resume ? 'Replace Resume' : 'Upload Resume'}
          </button>
          <input ref={resumeInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleResumeUpload} />
        </div>

        <Button type="submit" disabled={saving} className="w-full py-3">
          {saving ? 'Saving...' : 'Save Profile'}
          {!saving && <Save className="ml-2" />}
        </Button>
      </form>
    </div>
  );
};

export default StudentProfile;
