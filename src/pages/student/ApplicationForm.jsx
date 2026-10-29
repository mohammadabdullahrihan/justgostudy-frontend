import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import uploadService from '../../services/uploadService';
import courseService from '../../services/courseService';
import * as couponService from '../../services/couponService';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle, CloudUpload, FileText, Send, Trash2, Loader2, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const STEPS = ['Personal Info', 'Academic Info', 'Documents', 'Preview & Submit'];

const initialForm = {
  personalInfo: {
    firstName: '',
    lastName: '',
    passportNumber: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
  },
  academicInfo: {
    highestQualification: '',
    institutionName: '',
    cgpa: '',
    passingYear: '',
    ieltsOverall: '',
  },
  documents: [],
  couponCode: '',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const universityId = searchParams.get('universityId');
  const draftKey = `applicationDraft:${courseId || 'x'}:${universityId || 'x'}`;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      return saved ? { ...initialForm, ...JSON.parse(saved) } : initialForm;
    } catch {
      return initialForm;
    }
  });
  const [course, setCourse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [couponStatus, setCouponStatus] = useState(null); // null | 'checking' | 'valid' | 'invalid'
  const [couponInfo, setCouponInfo] = useState(null);

  const handleCheckCoupon = async () => {
    const code = (form.couponCode || '').trim();
    if (!code) return;
    setCouponStatus('checking');
    try {
      const coupon = await couponService.validateCoupon(code);
      setCouponInfo(coupon);
      setCouponStatus('valid');
    } catch (err) {
      setCouponInfo(null);
      setCouponStatus('invalid');
    }
  };

  useEffect(() => {
    if (courseId) {
      courseService.getCourseById(courseId).then((data) => setCourse(data)).catch(() => { });
    }
  }, [courseId]);

  // Persist a draft locally so a lost connection or accidental tab close
  // doesn't wipe out several minutes of form entry + already-uploaded documents.
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch {
      // localStorage may be unavailable (private browsing), draft saving is
      // a convenience, not a hard requirement, so fail silently.
    }
  }, [form, draftKey]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (success) return;
      const hasProgress = form.personalInfo.firstName || form.personalInfo.lastName
        || form.academicInfo.highestQualification || form.documents.length > 0;
      if (!hasProgress) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, success]);

  const updatePersonal = (field, value) =>
    setForm((f) => ({ ...f, personalInfo: { ...f.personalInfo, [field]: value } }));

  const updateAcademic = (field, value) =>
    setForm((f) => ({ ...f, academicInfo: { ...f.academicInfo, [field]: value } }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum file size is 5MB.`);
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await uploadService.uploadFile(file);
      const url = result.url || result.secure_url || result;
      setForm((f) => ({
        ...f,
        documents: [...f.documents, { name: file.name, url, type: file.type }],
      }));
    } catch (err) {
      setError('File upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (idx) =>
    setForm((f) => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }));

  const canProceed = () => {
    if (step === 0) {
      const p = form.personalInfo;
      return p.firstName && p.lastName && p.phone;
    }
    if (step === 1) {
      const a = form.academicInfo;
      return a.highestQualification && a.institutionName && a.cgpa && a.passingYear && a.ieltsOverall;
    }
    return true;
  };

  const missingFieldsMessage = () => {
    if (step === 0) {
      const p = form.personalInfo;
      const missing = [
        !p.firstName && 'First Name',
        !p.lastName && 'Last Name',
        !p.phone && 'Phone',
      ].filter(Boolean);
      return missing.length ? `Please fill in: ${missing.join(', ')}` : '';
    }
    if (step === 1) {
      const a = form.academicInfo;
      const missing = [
        !a.highestQualification && 'Highest Qualification',
        !a.institutionName && 'Institution Name',
        !a.cgpa && 'CGPA',
        !a.passingYear && 'Passing Year',
        !a.ieltsOverall && 'IELTS Overall',
      ].filter(Boolean);
      return missing.length ? `Please fill in: ${missing.join(', ')}` : '';
    }
    return '';
  };

  const handleApplicationSubmit = async () => {
    if (!courseId || !universityId) {
      setError('Course or university ID is missing. Please go back to the courses page.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await applicationService.createApplication({
        courseId,
        universityId,
        personalInfo: form.personalInfo,
        academicInfo: {
          ...form.academicInfo,
          cgpa: parseFloat(form.academicInfo.cgpa),
          passingYear: parseInt(form.academicInfo.passingYear),
          ieltsOverall: parseFloat(form.academicInfo.ieltsOverall),
        },
        documents: form.documents,
        couponCode: form.couponCode,
      });
      setSuccess(true);
      try { localStorage.removeItem(draftKey); } catch { /* noop */ }
      setTimeout(() => navigate('/student/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-primary-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold font-display text-ink-900 mb-2">Application Submitted!</h2>
        <p className="text-ink-600 text-sm">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-1">
          New <span className="text-primary-600">Application</span>
        </h1>
        {course && (
          <p className="text-ink-600 text-sm">
            Applying for: <span className="text-primary-600 font-semibold">{course.name}</span>
          </p>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const isDone = i <= step;
          return (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isDone
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-cream-200 bg-white text-ink-500'
                    }`}
                >
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-sm font-semibold hidden sm:block ${isDone ? 'text-ink-900' : 'text-ink-500'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded min-w-4 ${i < step ? 'bg-primary-600' : 'bg-cream-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm mb-5 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-ink-900 text-lg mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">First Name *</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} placeholder="John" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Last Name *</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Phone *</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Gender</label>
                <select className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.gender} onChange={(e) => updatePersonal('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input type="date" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.dateOfBirth} onChange={(e) => updatePersonal('dateOfBirth', e.target.value)} />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Passport Number</label>
                <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.passportNumber} onChange={(e) => updatePersonal('passportNumber', e.target.value)} placeholder="AB1234567" />
              </div>
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Address</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.personalInfo.address} onChange={(e) => updatePersonal('address', e.target.value)} placeholder="123 Main St, City, Country" />
            </div>
          </div>
        )}

        {/* Step 1: Academic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-ink-900 text-lg mb-4">Academic Information</h2>
            <div>
              <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Highest Qualification *</label>
              <select className="w-full px-3.5 py-2.5 bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.academicInfo.highestQualification} onChange={(e) => updateAcademic('highestQualification', e.target.value)}>
                <option value="">Select</option>
                <option value="SSC">SSC / O-Level</option>
                <option value="HSC">HSC / A-Level</option>
                <option value="Bachelor">Bachelor&apos;s Degree</option>
                <option value="Master">Master&apos;s Degree</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Institution Name *</label>
              <input className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.academicInfo.institutionName} onChange={(e) => updateAcademic('institutionName', e.target.value)} placeholder="University of XYZ" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">CGPA *</label>
                <input type="number" min="0" max="4" step="0.01" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.academicInfo.cgpa} onChange={(e) => updateAcademic('cgpa', e.target.value)} placeholder="3.50" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">Passing Year *</label>
                <input type="number" min="1990" max="2030" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.academicInfo.passingYear} onChange={(e) => updateAcademic('passingYear', e.target.value)} placeholder="2023" />
              </div>
              <div>
                <label className="block text-ink-500 text-sm font-bold uppercase tracking-wider mb-1.5">IELTS Overall *</label>
                <input type="number" min="0" max="9" step="0.5" className="w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" value={form.academicInfo.ieltsOverall} onChange={(e) => updateAcademic('ieltsOverall', e.target.value)} placeholder="6.5" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-ink-900 text-lg mb-4">Upload Documents</h2>
            <div className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center">
              <CloudUpload className="text-ink-400 mb-3 block mx-auto" size={32} />
              <p className="text-ink-600 text-sm mb-3">Upload transcripts, passport, certificates, etc.</p>
              <label className="cursor-pointer inline-block px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-all">
                {uploading ? 'Uploading...' : 'Choose File'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-ink-500 text-sm mt-3">PDF, JPG or PNG, up to 5MB per file</p>
            </div>
            {form.documents.length > 0 && (
              <ul className="space-y-2">
                {form.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-cream-50 border border-ink-100 rounded-xl px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-primary-600 shrink-0" />
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-ink-700 hover:text-primary-600 truncate">
                        {doc.name}
                      </a>
                    </div>
                    <button
                      onClick={() => removeDocument(idx)}
                      aria-label={`Remove ${doc.name}`}
                      className="text-ink-500 hover:text-rose-600 transition-all ml-3 shrink-0"
                    >
                      <Trash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-bold text-ink-900 text-lg mb-4">Review Your Application</h2>
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Personal Info</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-ink-500">Name</span>
                <span className="text-ink-900">{form.personalInfo.firstName} {form.personalInfo.lastName}</span>
                <span className="text-ink-500">Phone</span>
                <span className="text-ink-900">{form.personalInfo.phone || '—'}</span>
                <span className="text-ink-500">Gender</span>
                <span className="text-ink-900">{form.personalInfo.gender || '—'}</span>
                <span className="text-ink-500">Passport</span>
                <span className="text-ink-900">{form.personalInfo.passportNumber || '—'}</span>
              </div>
            </div>
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Academic Info</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-ink-500">Qualification</span>
                <span className="text-ink-900">{form.academicInfo.highestQualification}</span>
                <span className="text-ink-500">Institution</span>
                <span className="text-ink-900">{form.academicInfo.institutionName}</span>
                <span className="text-ink-500">CGPA</span>
                <span className="text-ink-900">{form.academicInfo.cgpa}</span>
                <span className="text-ink-500">Passing Year</span>
                <span className="text-ink-900">{form.academicInfo.passingYear}</span>
                <span className="text-ink-500">IELTS</span>
                <span className="text-ink-900">{form.academicInfo.ieltsOverall}</span>
              </div>
            </div>
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Documents ({form.documents.length})</h3>
              {form.documents.length === 0 ? (
                <p className="text-ink-500 text-sm">No documents uploaded.</p>
              ) : (
                <ul className="space-y-1">
                  {form.documents.map((d, i) => (
                    <li key={i} className="text-sm text-ink-700 flex items-center gap-2">
                      <FileText className="text-primary-600" size={12} />
                      {d.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Coupon / Referral Code (optional)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => {
                    setForm({ ...form, couponCode: e.target.value.toUpperCase() });
                    setCouponStatus(null);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-white text-ink-900 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all uppercase"
                  placeholder="e.g. WELCOME500"
                />
                <button
                  type="button"
                  onClick={handleCheckCoupon}
                  disabled={!form.couponCode?.trim() || couponStatus === 'checking'}
                  className="px-4 py-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-600 hover:border-primary-300 disabled:opacity-50 transition-all"
                >
                  {couponStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponStatus === 'valid' && couponInfo && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-secondary-600">
                  <Check className="w-3.5 h-3.5" />
                  Applied — {couponInfo.discountType === 'percentage' ? `${couponInfo.discountValue}% off` : `৳${couponInfo.discountValue} off`}
                </p>
              )}
              {couponStatus === 'invalid' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-rose-500">
                  <XCircle className="w-3.5 h-3.5" />
                  Invalid or expired code
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-ink-100">
          {step < STEPS.length - 1 && !canProceed() && (
            <p className="text-sm text-rose-500 font-semibold mb-3 text-right">{missingFieldsMessage()}</p>
          )}
          <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button onClick={() => setStep((s) => s - 1)} variant="secondary" className="py-2 px-5 text-sm">
              <ArrowLeft className="mr-2" />Back
            </Button>
          ) : (
            <div></div>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="py-2 px-5 text-sm"
            >
              Next <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleApplicationSubmit}
              disabled={submitting}
              className="py-2 px-6 text-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
              {!submitting && <Send className="ml-2" />}
            </Button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
