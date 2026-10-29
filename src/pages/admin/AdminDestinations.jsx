import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus, Edit, Trash2, X, Globe, Loader2, BookOpen, DollarSign, Award,
  Briefcase, Users, Calendar, RotateCcw, UploadCloud, Star,
  Heart, Info, ShieldCheck, GraduationCap, ChevronRight, HelpCircle,
  Compass, Languages, Home
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { REGIONS } from '../../constants/regions';
import { useAdminList } from '../../hooks/useAdminList';

const flagUrl = (countryCode) => (countryCode ? `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png` : null);

const money = (n) => (n || n === 0 ? `$${Number(n).toLocaleString()}` : '—');

// One solid banner color per country, picked up from that country's own
// flag (its most saturated color, not a muddy average) so the card reads
// as "this is France" rather than a random brand-color roulette.
const FALLBACK_TONE = '#f5f5f6'; // cream-100, while the flag color loads or on failure
const flagColorCache = new Map();

const extractFlagAccent = (img) => {
  const canvas = document.createElement('canvas');
  const w = (canvas.width = 24);
  const h = (canvas.height = 16);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let best = null;
  let bestScore = -1;
  let sumR = 0, sumG = 0, sumB = 0, count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    if (lightness > 235 || lightness < 20) continue; // skip near-white/near-black
    const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    sumR += r; sumG += g; sumB += b; count += 1;
    // Prefer the most saturated pixel as the flag's signature color, so a
    // red-white-blue flag reads as red or blue, not a washed-out purple.
    if (saturation > bestScore) { bestScore = saturation; best = { r, g, b }; }
  }

  if (!best) {
    if (!count) return null;
    best = { r: sumR / count, g: sumG / count, b: sumB / count };
  }

  // Blend toward white for a light, legible pastel banner (same spirit as
  // the primary-100/secondary-100 tints used elsewhere in this dashboard).
  const mix = 0.72;
  const r = Math.round(best.r + (255 - best.r) * mix);
  const g = Math.round(best.g + (255 - best.g) * mix);
  const b = Math.round(best.b + (255 - best.b) * mix);
  return `rgb(${r}, ${g}, ${b})`;
};

const useFlagAccent = (countryCode) => {
  const [color, setColor] = useState(() => flagColorCache.get(countryCode) || null);

  useEffect(() => {
    if (!countryCode) return;
    if (flagColorCache.has(countryCode)) {
      setColor(flagColorCache.get(countryCode));
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      let rgb = null;
      try { rgb = extractFlagAccent(img); } catch { rgb = null; }
      flagColorCache.set(countryCode, rgb);
      setColor(rgb);
    };
    img.onerror = () => {
      if (cancelled) return;
      flagColorCache.set(countryCode, null);
      setColor(null);
    };
    img.src = flagUrl(countryCode);
    return () => { cancelled = true; };
  }, [countryCode]);

  return color;
};

// Plain-language field wrapper: label + optional helper text explaining
// where this shows up on the public site, so non-technical admins don't
// have to guess what a field does before filling it in.
const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-ink-800">{label}</label>
    {children}
    {hint && <p className="text-xs text-ink-400">{hint}</p>}
  </div>
);

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Globe, blurb: 'The name, flag, region and price tags shown on the destination card.' },
  { id: 'guide', label: 'Guide Content', icon: BookOpen, blurb: 'The written guide students read on the country’s detail page.' },
  { id: 'bangladeshi', label: 'For Bangladeshi Students', icon: Users, blurb: 'Extra guidance shown specifically to students applying from Bangladesh.' },
  { id: 'highlights', label: 'Highlights & FAQ', icon: Star, blurb: 'Why-study-here points and frequently asked questions.' },
  { id: 'more', label: 'Scholarships & Careers', icon: Award, blurb: 'Scholarship listings, career outcomes, lifestyle info and the visa checklist.' },
  { id: 'academic', label: 'Country & Education', icon: Compass, blurb: 'Country background info, how the education system works, and vocational training — shown in the About, Education System and Vocational Education tabs.' },
  { id: 'language-schools', label: 'Language & Schools', icon: Languages, blurb: 'Language-learning info and secondary school details for younger students.' },
  { id: 'living', label: 'Living Guide', icon: Home, blurb: 'Practical living details — before departure, arrival, accommodation, money, safety, communications, recreation and adjusting — shown in the Living Guide tab.' },
];

const inputCls = 'w-full bg-cream-50 border border-ink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium text-sm';
const textareaCls = `${inputCls} h-24 resize-none`;

const DestinationCard = ({ dest, idx, onEdit, onDelete }) => {
  const flagAccent = useFlagAccent(dest.countryCode);

  return (
    <div className="bg-white rounded-[28px] border border-ink-100 shadow-theme-sm hover:shadow-theme-lg transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Flag banner */}
      <div className="relative h-24 overflow-hidden flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: flagAccent || FALLBACK_TONE }}>
        <div className="relative w-14 h-14 rounded-2xl bg-white ring-4 ring-white shadow-theme-lg overflow-hidden flex items-center justify-center">
          {dest.countryCode ? (
            <img src={flagUrl(dest.countryCode)} alt={dest.country} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          ) : null}
          <Globe className="w-6 h-6 text-primary-600" style={{ display: dest.countryCode ? 'none' : 'block' }} />
        </div>
        <span className="absolute top-3 left-3 min-w-[22px] h-[22px] px-1 rounded-full bg-white/90 backdrop-blur text-[12px] font-bold text-ink-600 flex items-center justify-center shadow-theme-sm" title="Position on the public page">
          #{idx + 1}
        </span>
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full shadow-theme-sm ${dest.isActive ? 'bg-secondary-500 text-white' : 'bg-ink-500 text-white'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dest.isActive ? 'bg-white' : 'bg-ink-300'}`} />
          {dest.isActive ? 'Visible' : 'Hidden'}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="font-bold text-lg text-ink-900 mb-1">{dest.country}</h4>
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wide w-fit mb-3">
          <Globe className="w-3 h-3" /> {dest.region || 'No region set'}
        </span>
        {dest.description && (
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-2 mb-4">{dest.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-ink-100">
          <div>
            <p className="text-[11px] font-bold text-ink-400 uppercase tracking-wider mb-0.5">Avg Tuition</p>
            <p className="text-sm font-bold text-ink-800">{money(dest.avgTuition)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-ink-400 uppercase tracking-wider mb-0.5">Universities</p>
            <p className="text-sm font-bold text-ink-800 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-primary-500" /> {dest.universityCount ?? 0}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(dest)} className="p-2 bg-cream-50 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all border border-ink-100">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(dest._id)} className="p-2 bg-cream-50 rounded-xl text-rose-600 hover:bg-rose-500 hover:text-white transition-all border border-ink-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RepeatingCard = ({ index, onRemove, children }) => (
  <div className="bg-white p-4 rounded-xl border border-ink-100">
    <div className="flex justify-between items-start mb-3">
      <span className="text-xs font-bold text-ink-400">#{index + 1}</span>
      <button type="button" onClick={onRemove} className="text-rose-500 hover:text-rose-600">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const AddButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:text-primary-700">
    <Plus className="w-3.5 h-3.5" /> {children}
  </button>
);

const DestinationManagement = () => {
  const { data: destinations, loading, error, refetch: fetchDestinations } = useAdminList(async () => {
    // List view only needs card-level fields — the backend projects out the
    // heavier guide content here (see destinationController.getDestinations).
    const destRes = await studyService.getDestinations();
    const destData = Array.isArray(destRes) ? destRes : (destRes.destinations || destRes.data || []);
    return Array.isArray(destData) ? destData : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const emptyForm = {
    // Basic Destination fields
    country: '', countryCode: '', isActive: true, order: 0,
    region: '', description: '', avgTuition: '', avgLivingCost: '', currency: 'USD',
    totalUniversitiesInCountry: '', totalProgramsInCountry: '',
    language: 'English', climate: 'Temperate', timezone: 'UTC+0', visaFee: '', studentCount: '10K+',
    // Country Guide fields
    requirements: '',
    costing: '',
    living: '',
    livingCostBreakdown: [],
    scholarships: '',
    studyWork: '',
    workAfterGraduation: '',
    opportunities: '',
    guidePdfUrl: '',
    // Intakes
    intakeBachelor: '',
    intakeMaster: '',
    intakePhd: '',
    // Bangladeshi details
    bdVisaSuccessRate: '',
    bdPopularCourses: '',
    bdScholarships: '',
    bdEntryRequirements: '',
    bdPartTimeWork: '',
    bdCommunitySupport: '',
    // Highlights & extras
    whyStudyHere: [],
    faqs: [],
    scholarshipsData: [],
    careerData: { avgStartingSalary: '', growthRate: '', topCompanies: [], popularJobRoles: [] },
    lifestyle: { weather: '', publicTransport: '', postArrival: [] },
    visaChecklist: [],
    visaTypes: [],
    postStudyImmigration: '',
    visaOverview: '',
    whoNeedsVisa: '',
    aboutCountry: { overview: '', historyAndGovernment: '', populationAndCulture: '', geographyAndClimate: '' },
    educationSystem: { overview: '', levelsOfStudy: '', degreeRecognition: '' },
    institutionTypes: [],
    vocationalEducation: { overview: '' },
    vocationalPrograms: [],
    languageLearning: { overview: '', findingCourses: '', certifications: '', visaForLanguageStudy: '' },
    secondarySchools: { overview: '', schoolCalendarAndStyle: '', schoolTypes: '', exchangeAndSummerPrograms: '', juniorVisaInfo: '', transitionToHigherEd: '' },
    livingGuide: { beforeDeparture: '', arrival: '', accommodation: '', moneyMatters: '', safety: '', communications: '', recreation: '', adjusting: '' }
  };
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = async (dest = null) => {
    setShowModal(true);
    setActiveTab('basic');

    if (!dest) {
      setEditTarget(null);
      setForm(emptyForm);
      return;
    }

    setEditTarget(dest);
    setModalLoading(true);
    try {
      // Full document (with guide content) — the list only had card fields.
      const guide = await studyService.getDestinationByCountry(dest.country);
      setForm({
        ...emptyForm,
        ...guide,
        intakeBachelor: guide?.intakes?.bachelor || '',
        intakeMaster: guide?.intakes?.master || '',
        intakePhd: guide?.intakes?.phd || '',
        bdVisaSuccessRate: guide?.bangladeshiDetails?.visaSuccessRate || '',
        bdPopularCourses: guide?.bangladeshiDetails?.popularCourses?.join(', ') || '',
        bdScholarships: guide?.bangladeshiDetails?.scholarshipsForBD?.join(', ') || '',
        bdEntryRequirements: guide?.bangladeshiDetails?.entryRequirements || '',
        bdPartTimeWork: guide?.bangladeshiDetails?.partTimeWork || '',
        bdCommunitySupport: guide?.bangladeshiDetails?.communitySupport || ''
      });
    } catch (error) {
      console.error('Error loading destination details:', error);
      toast.error('Error loading destination details');
      setForm({ ...emptyForm, ...dest });
    } finally {
      setModalLoading(false);
    }
  };

  const addDynamicItem = (field, defaultItem = {}) => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), defaultItem] }));
  };

  const removeDynamicItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const updateDynamicItem = (field, index, updates) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, ...updates } : item)
    }));
  };

  const addToArrayField = (parentField, arrayField, defaultItem = '') => {
    setForm(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [arrayField]: [...(prev[parentField][arrayField] || []), defaultItem]
      }
    }));
  };

  const removeFromArrayField = (parentField, arrayField, index) => {
    setForm(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [arrayField]: prev[parentField][arrayField].filter((_, i) => i !== index)
      }
    }));
  };

  const updateNestedField = (path, value) => {
    setForm(prev => {
      const newForm = { ...prev };
      const keys = path.split('.');
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const result = await uploadService.uploadFile(file);
      setForm((prev) => ({ ...prev, guidePdfUrl: result.url }));
      toast.success('Country guide PDF uploaded');
    } catch (error) {
      toast.error(error.message || 'Error uploading PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        country: form.country,
        countryCode: form.countryCode,
        isActive: form.isActive,
        order: form.order,
        region: form.region,
        description: form.description,
        avgTuition: form.avgTuition,
        avgLivingCost: form.avgLivingCost,
        currency: form.currency,
        totalUniversitiesInCountry: form.totalUniversitiesInCountry,
        totalProgramsInCountry: form.totalProgramsInCountry,
        language: form.language,
        climate: form.climate,
        timezone: form.timezone,
        visaFee: form.visaFee,
        studentCount: form.studentCount,
        requirements: form.requirements,
        costing: form.costing,
        living: form.living,
        livingCostBreakdown: form.livingCostBreakdown,
        scholarships: form.scholarships,
        studyWork: form.studyWork,
        workAfterGraduation: form.workAfterGraduation,
        opportunities: form.opportunities,
        guidePdfUrl: form.guidePdfUrl,
        intakes: {
          bachelor: form.intakeBachelor,
          master: form.intakeMaster,
          phd: form.intakePhd
        },
        bangladeshiDetails: {
          visaSuccessRate: form.bdVisaSuccessRate,
          popularCourses: form.bdPopularCourses.split(',').map(s => s.trim()).filter(Boolean),
          scholarshipsForBD: form.bdScholarships.split(',').map(s => s.trim()).filter(Boolean),
          entryRequirements: form.bdEntryRequirements,
          partTimeWork: form.bdPartTimeWork,
          communitySupport: form.bdCommunitySupport
        },
        whyStudyHere: form.whyStudyHere,
        faqs: form.faqs,
        scholarshipsData: form.scholarshipsData,
        careerData: form.careerData,
        lifestyle: form.lifestyle,
        visaChecklist: form.visaChecklist,
        visaTypes: form.visaTypes,
        postStudyImmigration: form.postStudyImmigration,
        visaOverview: form.visaOverview,
        whoNeedsVisa: form.whoNeedsVisa,
        aboutCountry: form.aboutCountry,
        educationSystem: form.educationSystem,
        institutionTypes: form.institutionTypes,
        vocationalEducation: form.vocationalEducation,
        vocationalPrograms: form.vocationalPrograms,
        languageLearning: form.languageLearning,
        secondarySchools: form.secondarySchools,
        livingGuide: form.livingGuide
      };

      if (editTarget) {
        await studyService.updateDestination(editTarget._id, payload);
      } else {
        await studyService.createDestination(payload);
      }

      setShowModal(false);
      fetchDestinations();
    } catch (error) {
      toast.error(error.message || 'Error saving destination');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDestinationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!destinationToDelete) return;
    try {
      await studyService.deleteDestination(destinationToDelete);
      fetchDestinations();
    } catch (error) {
      toast.error('Error deleting destination');
    }
    setDestinationToDelete(null);
  };

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Popular Destinations</h2>
          <p className="text-ink-500 text-sm">Manage the countries displayed on the Study Abroad home page.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDestinations} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Destination
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, idx) => (
            <DestinationCard key={dest._id} dest={dest} idx={idx} onEdit={handleOpenModal} onDelete={handleDeleteClick} />
          ))}
          {!error && destinations.length === 0 && (
            <div className="col-span-full text-center py-20 bg-cream-50 rounded-[32px] border-2 border-dashed border-ink-200">
              <p className="text-ink-500">No destinations found. Add your first featured country!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] shadow-theme-lg flex flex-col">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-cream-50/50 rounded-t-[32px]">
              <div>
                <h3 className="text-xl font-bold text-ink-900">{editTarget ? `Edit ${form.country || 'Destination'}` : 'Add a New Destination'}</h3>
                <p className="text-xs text-ink-500 mt-1">Fill in as much or as little as you like — you can always come back and add more later.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : (
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Section nav — stacked list on desktop, wrapping grid on mobile.
                    A fixed list rather than a horizontal scroller so nothing slides. */}
                <div className="md:w-56 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-ink-100 bg-cream-50/40 p-3 md:p-4 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
                    {TABS.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-theme-sm'
                              : 'text-ink-500 hover:bg-white hover:text-ink-800'
                          }`}
                        >
                          <TabIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="leading-tight">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <p className="px-6 md:px-8 pt-5 md:pt-6 pb-2 text-xs text-ink-400 flex items-center gap-1.5 flex-shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" /> {currentTab.blurb}
                  </p>
                  <div className="px-6 md:px-8 pb-8 overflow-y-auto flex-1">
                {/* ---------------- Basic Info ---------------- */}
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Country Name">
                        <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
                      </Field>
                      <Field label="Region">
                        <select className={inputCls} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required>
                          <option value="">Select a region</option>
                          {REGIONS.map((region) => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Flag Code" hint="The 2-letter country code used to fetch the flag icon, e.g. US, GB, CA.">
                      <div className="flex items-center gap-3">
                        <input
                          className={`${inputCls} w-32 uppercase`}
                          value={form.countryCode}
                          onChange={(e) => setForm({ ...form, countryCode: e.target.value.slice(0, 2).toUpperCase() })}
                          placeholder="US"
                          maxLength={2}
                          required
                        />
                        {form.countryCode?.length === 2 && (
                          <img src={flagUrl(form.countryCode)} alt="Flag preview" className="w-10 h-7 object-cover rounded border border-ink-200" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                        )}
                      </div>
                    </Field>
                    <Field label="Short Description" hint="A one or two sentence teaser shown on the destination card.">
                      <textarea className={textareaCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description for the destination card..." />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Average Tuition (per year)">
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input type="number" className={`${inputCls} pl-10`} value={form.avgTuition} onChange={(e) => setForm({ ...form, avgTuition: e.target.value })} placeholder="20000" />
                        </div>
                      </Field>
                      <Field label="Average Living Cost (per year)">
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input type="number" className={`${inputCls} pl-10`} value={form.avgLivingCost} onChange={(e) => setForm({ ...form, avgLivingCost: e.target.value })} placeholder="12000" />
                        </div>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Total Universities in Country" hint="The country's real total (e.g. Australia has 43 universities) — shown on the destination card so it doesn't look like JustTrip only knows a handful. Leave blank to just show what's onboarded.">
                        <input type="number" className={inputCls} value={form.totalUniversitiesInCountry} onChange={(e) => setForm({ ...form, totalUniversitiesInCountry: e.target.value })} placeholder="43" />
                      </Field>
                      <Field label="Total Programs in Country" hint="Rough real-world total for the country, not just what's onboarded on JustTrip.">
                        <input type="number" className={inputCls} value={form.totalProgramsInCountry} onChange={(e) => setForm({ ...form, totalProgramsInCountry: e.target.value })} placeholder="1200" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-ink-100">
                      <Field label="Show on Website?">
                        <select className={inputCls} value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                          <option value="true">Visible (students can see it)</option>
                          <option value="false">Hidden (not shown yet)</option>
                        </select>
                      </Field>
                      <Field label="Display Order" hint="Lower numbers appear first on the page (1, 2, 3...).">
                        <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                      </Field>
                    </div>
                    <details className="group/details">
                      <summary className="cursor-pointer text-sm font-bold text-ink-500 flex items-center gap-2 select-none">
                        <ChevronRight className="w-4 h-4 transition-transform group-open/details:rotate-90" />
                        More details (currency, language, climate...)
                      </summary>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <Field label="Currency Code">
                          <input className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD" />
                        </Field>
                        <Field label="Language Spoken">
                          <input className={inputCls} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                        </Field>
                        <Field label="Climate">
                          <input className={inputCls} value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })} />
                        </Field>
                        <Field label="Timezone">
                          <input className={inputCls} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
                        </Field>
                        <Field label="Visa Fee">
                          <input className={inputCls} value={form.visaFee} onChange={(e) => setForm({ ...form, visaFee: e.target.value })} />
                        </Field>
                        <Field label="International Student Count" hint="A rough figure shown as a stat, e.g. 10K+.">
                          <input className={inputCls} value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })} placeholder="10K+" />
                        </Field>
                      </div>
                    </details>
                  </div>
                )}

                {/* ---------------- Guide Content ---------------- */}
                {activeTab === 'guide' && (
                  <div className="space-y-5">
                    <Field label="Admission Requirements">
                      <textarea className={textareaCls} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="IELTS 6.5+, Academic transcripts, SOP, LORs..." />
                    </Field>
                    <Field label="Cost of Education">
                      <textarea className={textareaCls} value={form.costing} onChange={(e) => setForm({ ...form, costing: e.target.value })} placeholder="Bachelor's: $15k-25k/year, Master's: $20k-35k/year..." />
                    </Field>
                    <Field label="Living Information">
                      <textarea className={textareaCls} value={form.living} onChange={(e) => setForm({ ...form, living: e.target.value })} placeholder="Accommodation options, monthly expenses, lifestyle..." />
                    </Field>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800">Living Cost Breakdown</p>
                        <AddButton onClick={() => addDynamicItem('livingCostBreakdown', { category: '', amount: '' })}>Add Line Item</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.livingCostBreakdown?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('livingCostBreakdown', index)}>
                            <Field label="Category"><input className={inputCls} value={item.category} onChange={(e) => updateDynamicItem('livingCostBreakdown', index, { category: e.target.value })} placeholder="Rent" /></Field>
                            <Field label="Amount"><input className={inputCls} value={item.amount} onChange={(e) => updateDynamicItem('livingCostBreakdown', index, { amount: e.target.value })} placeholder="$500-700/month" /></Field>
                          </RepeatingCard>
                        ))}
                        {!form.livingCostBreakdown?.length && <p className="text-xs text-ink-400 italic">No cost breakdown added yet — the Living Information paragraph above will show instead.</p>}
                      </div>
                    </div>
                    <Field label="Scholarships">
                      <textarea className={textareaCls} value={form.scholarships} onChange={(e) => setForm({ ...form, scholarships: e.target.value })} placeholder="Government scholarships, university grants, eligibility..." />
                    </Field>
                    <Field label="Study & Work Opportunities" hint="Rules for working while still studying (hours/week, restrictions).">
                      <textarea className={textareaCls} value={form.studyWork} onChange={(e) => setForm({ ...form, studyWork: e.target.value })} placeholder="Part-time work rules, hours per week, restrictions..." />
                    </Field>
                    <Field label="Work After Graduation" hint="Work rights after finishing studies (PSW visa, job market).">
                      <textarea className={textareaCls} value={form.workAfterGraduation} onChange={(e) => setForm({ ...form, workAfterGraduation: e.target.value })} placeholder="Post-study work visa, duration, job market outlook..." />
                    </Field>
                    <Field label="Post-Study Opportunities">
                      <textarea className={textareaCls} value={form.opportunities} onChange={(e) => setForm({ ...form, opportunities: e.target.value })} placeholder="PR pathways, job prospects, career growth..." />
                    </Field>
                    <Field label="Downloadable Guide PDF" hint="Leave empty to hide the download button on the destination page.">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-ink-200 bg-cream-50 font-medium text-sm cursor-pointer hover:border-primary-300">
                          <UploadCloud className="w-4 h-4 text-primary-600" />
                          {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                          <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
                        </label>
                        {form.guidePdfUrl && (
                          <a href={form.guidePdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary-600 hover:underline truncate max-w-[200px]">
                            View uploaded PDF
                          </a>
                        )}
                      </div>
                    </Field>
                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary-600" /> Intake Periods</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Bachelor's">
                          <input className={inputCls} value={form.intakeBachelor} onChange={(e) => setForm({ ...form, intakeBachelor: e.target.value })} placeholder="Fall, Winter, Spring" />
                        </Field>
                        <Field label="Master's">
                          <input className={inputCls} value={form.intakeMaster} onChange={(e) => setForm({ ...form, intakeMaster: e.target.value })} placeholder="Fall, Winter" />
                        </Field>
                        <Field label="PhD">
                          <input className={inputCls} value={form.intakePhd} onChange={(e) => setForm({ ...form, intakePhd: e.target.value })} placeholder="Year-round" />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- For Bangladeshi Students ---------------- */}
                {activeTab === 'bangladeshi' && (
                  <div className="space-y-5">
                    <Field label="Visa Success Rate">
                      <input className={inputCls} value={form.bdVisaSuccessRate} onChange={(e) => setForm({ ...form, bdVisaSuccessRate: e.target.value })} placeholder="85-90% with proper documentation" />
                    </Field>
                    <Field label="Popular Courses" hint="Separate each course with a comma.">
                      <input className={inputCls} value={form.bdPopularCourses} onChange={(e) => setForm({ ...form, bdPopularCourses: e.target.value })} placeholder="Computer Science, Business, Engineering, Nursing" />
                    </Field>
                    <Field label="Scholarships for BD Students" hint="Separate each scholarship with a comma.">
                      <input className={inputCls} value={form.bdScholarships} onChange={(e) => setForm({ ...form, bdScholarships: e.target.value })} placeholder="Commonwealth, Chevening, DAAD" />
                    </Field>
                    <Field label="Entry Requirements for BD Students">
                      <textarea className={textareaCls} value={form.bdEntryRequirements} onChange={(e) => setForm({ ...form, bdEntryRequirements: e.target.value })} placeholder="HSC with 3.5+ CGPA, IELTS 6.5, Bank solvency..." />
                    </Field>
                    <Field label="Part-time Work Rules">
                      <textarea className={textareaCls} value={form.bdPartTimeWork} onChange={(e) => setForm({ ...form, bdPartTimeWork: e.target.value })} placeholder="20 hours/week during term, full-time during breaks..." />
                    </Field>
                    <Field label="Bangladeshi Community Support">
                      <textarea className={textareaCls} value={form.bdCommunitySupport} onChange={(e) => setForm({ ...form, bdCommunitySupport: e.target.value })} placeholder="BD Student Associations, mosques, grocery stores..." />
                    </Field>
                  </div>
                )}

                {/* ---------------- Reviews & Highlights ---------------- */}
                {activeTab === 'highlights' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Star className="w-4 h-4 text-accent-500" /> Why Study Here</p>
                        <AddButton onClick={() => addDynamicItem('whyStudyHere', { title: '', desc: '', icon: 'GraduationCap' })}>Add Point</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.whyStudyHere?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('whyStudyHere', index)}>
                            <Field label="Title"><input className={inputCls} value={item.title} onChange={(e) => updateDynamicItem('whyStudyHere', index, { title: e.target.value })} /></Field>
                            <Field label="Description"><textarea className={`${inputCls} h-16 resize-none`} value={item.desc} onChange={(e) => updateDynamicItem('whyStudyHere', index, { desc: e.target.value })} /></Field>
                          </RepeatingCard>
                        ))}
                        {!form.whyStudyHere?.length && <p className="text-xs text-ink-400 italic">No highlight points added yet.</p>}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Info className="w-4 h-4 text-primary-600" /> Frequently Asked Questions</p>
                        <AddButton onClick={() => addDynamicItem('faqs', { question: '', answer: '' })}>Add FAQ</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.faqs?.map((faq, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('faqs', index)}>
                            <div className="md:col-span-2">
                              <Field label="Question"><input className={inputCls} value={faq.question} onChange={(e) => updateDynamicItem('faqs', index, { question: e.target.value })} /></Field>
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Answer"><textarea className={`${inputCls} h-16 resize-none`} value={faq.answer} onChange={(e) => updateDynamicItem('faqs', index, { answer: e.target.value })} /></Field>
                            </div>
                          </RepeatingCard>
                        ))}
                        {!form.faqs?.length && <p className="text-xs text-ink-400 italic">No FAQs added yet.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- Scholarships & Careers ---------------- */}
                {activeTab === 'more' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Award className="w-4 h-4 text-accent-600" /> Scholarships</p>
                        <AddButton onClick={() => addDynamicItem('scholarshipsData', { title: '', description: '', amount: '', deadline: '', icon: 'AwardIcon' })}>Add Scholarship</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.scholarshipsData?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('scholarshipsData', index)}>
                            <Field label="Title"><input className={inputCls} value={item.title} onChange={(e) => updateDynamicItem('scholarshipsData', index, { title: e.target.value })} /></Field>
                            <Field label="Amount"><input className={inputCls} value={item.amount} onChange={(e) => updateDynamicItem('scholarshipsData', index, { amount: e.target.value })} /></Field>
                            <Field label="Deadline"><input className={inputCls} value={item.deadline} onChange={(e) => updateDynamicItem('scholarshipsData', index, { deadline: e.target.value })} /></Field>
                            <div className="md:col-span-2">
                              <Field label="Description"><textarea className={`${inputCls} h-16 resize-none`} value={item.description} onChange={(e) => updateDynamicItem('scholarshipsData', index, { description: e.target.value })} /></Field>
                            </div>
                          </RepeatingCard>
                        ))}
                        {!form.scholarshipsData?.length && <p className="text-xs text-ink-400 italic">No scholarships added yet.</p>}
                      </div>
                    </div>

                    <div className="bg-cream-50 p-5 rounded-2xl border border-ink-100">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2 mb-4"><Briefcase className="w-4 h-4 text-primary-600" /> Career Outcomes</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <Field label="Average Starting Salary">
                          <input className={inputCls} value={form.careerData?.avgStartingSalary} onChange={(e) => updateNestedField('careerData.avgStartingSalary', e.target.value)} />
                        </Field>
                        <Field label="Job Growth Rate">
                          <input className={inputCls} value={form.careerData?.growthRate} onChange={(e) => updateNestedField('careerData.growthRate', e.target.value)} />
                        </Field>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-ink-600">Top Hiring Companies</label>
                          <AddButton onClick={() => addToArrayField('careerData', 'topCompanies', '')}>Add</AddButton>
                        </div>
                        {form.careerData?.topCompanies?.map((company, index) => (
                          <div key={index} className="flex gap-2">
                            <input className={`flex-1 ${inputCls}`} value={company} onChange={(e) => {
                              const newCompanies = [...form.careerData.topCompanies];
                              newCompanies[index] = e.target.value;
                              updateNestedField('careerData.topCompanies', newCompanies);
                            }} />
                            <button type="button" onClick={() => removeFromArrayField('careerData', 'topCompanies', index)} className="text-rose-500 px-2"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-ink-600">Popular Job Roles</label>
                          <AddButton onClick={() => addToArrayField('careerData', 'popularJobRoles', '')}>Add</AddButton>
                        </div>
                        {form.careerData?.popularJobRoles?.map((role, index) => (
                          <div key={index} className="flex gap-2">
                            <input className={`flex-1 ${inputCls}`} value={role} onChange={(e) => {
                              const newRoles = [...form.careerData.popularJobRoles];
                              newRoles[index] = e.target.value;
                              updateNestedField('careerData.popularJobRoles', newRoles);
                            }} />
                            <button type="button" onClick={() => removeFromArrayField('careerData', 'popularJobRoles', index)} className="text-rose-500 px-2"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-cream-50 p-5 rounded-2xl border border-ink-100">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2 mb-4"><Heart className="w-4 h-4 text-rose-500" /> Lifestyle</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <Field label="Weather & Climate">
                          <textarea className={`${inputCls} h-20 resize-none`} value={form.lifestyle?.weather} onChange={(e) => updateNestedField('lifestyle.weather', e.target.value)} />
                        </Field>
                        <Field label="Public Transport">
                          <textarea className={`${inputCls} h-20 resize-none`} value={form.lifestyle?.publicTransport} onChange={(e) => updateNestedField('lifestyle.publicTransport', e.target.value)} />
                        </Field>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-ink-600">Post-Arrival Essentials</label>
                        <AddButton onClick={() => addToArrayField('lifestyle', 'postArrival', { title: '', description: '', icon: 'Home' })}>Add</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.lifestyle?.postArrival?.map((item, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl border border-ink-100">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-bold text-ink-400">#{index + 1}</span>
                              <button type="button" onClick={() => removeFromArrayField('lifestyle', 'postArrival', index)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Field label="Title">
                                <input className={inputCls} value={item.title} onChange={(e) => {
                                  const newItems = [...form.lifestyle.postArrival];
                                  newItems[index] = { ...newItems[index], title: e.target.value };
                                  updateNestedField('lifestyle.postArrival', newItems);
                                }} />
                              </Field>
                              <div className="md:col-span-2">
                                <Field label="Description">
                                  <textarea className={`${inputCls} h-16 resize-none`} value={item.description} onChange={(e) => {
                                    const newItems = [...form.lifestyle.postArrival];
                                    newItems[index] = { ...newItems[index], description: e.target.value };
                                    updateNestedField('lifestyle.postArrival', newItems);
                                  }} />
                                </Field>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!form.lifestyle?.postArrival?.length && <p className="text-xs text-ink-400 italic">No post-arrival tips added yet.</p>}
                      </div>
                    </div>

                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary-600" /> Visa Basics</p>
                      <Field label="Visa Overview" hint="A short intro shown at the top of the Visa tab.">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.visaOverview} onChange={(e) => setForm({ ...form, visaOverview: e.target.value })} />
                      </Field>
                      <Field label="Who Needs a Visa">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.whoNeedsVisa} onChange={(e) => setForm({ ...form, whoNeedsVisa: e.target.value })} placeholder="Who requires a student visa vs. who doesn't (e.g. course length thresholds)..." />
                      </Field>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary-600" /> Visa Types</p>
                        <AddButton onClick={() => addDynamicItem('visaTypes', { name: '', description: '', eligibility: '' })}>Add Visa Type</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.visaTypes?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('visaTypes', index)}>
                            <Field label="Visa Name"><input className={inputCls} value={item.name} onChange={(e) => updateDynamicItem('visaTypes', index, { name: e.target.value })} placeholder="Student Visa (Long-Stay)" /></Field>
                            <Field label="Who Needs It"><input className={inputCls} value={item.eligibility} onChange={(e) => updateDynamicItem('visaTypes', index, { eligibility: e.target.value })} placeholder="Courses longer than 90 days" /></Field>
                            <div className="md:col-span-2">
                              <Field label="Description"><textarea className={`${inputCls} h-16 resize-none`} value={item.description} onChange={(e) => updateDynamicItem('visaTypes', index, { description: e.target.value })} /></Field>
                            </div>
                          </RepeatingCard>
                        ))}
                        {!form.visaTypes?.length && <p className="text-xs text-ink-400 italic">No visa types added yet.</p>}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary-600" /> Visa Checklist</p>
                        <AddButton onClick={() => addDynamicItem('visaChecklist', { item: '', required: true })}>Add Item</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.visaChecklist?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('visaChecklist', index)}>
                            <Field label="Item"><input className={inputCls} value={item.item} onChange={(e) => updateDynamicItem('visaChecklist', index, { item: e.target.value })} /></Field>
                            <Field label="Required?">
                              <select className={inputCls} value={item.required} onChange={(e) => updateDynamicItem('visaChecklist', index, { required: e.target.value === 'true' })}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </Field>
                          </RepeatingCard>
                        ))}
                        {!form.visaChecklist?.length && <p className="text-xs text-ink-400 italic">No checklist items added yet.</p>}
                      </div>
                    </div>

                    <Field label="Post-Study Immigration" hint="PSW / PR pathway shown as a callout at the bottom of the Visa tab.">
                      <textarea className={textareaCls} value={form.postStudyImmigration} onChange={(e) => setForm({ ...form, postStudyImmigration: e.target.value })} placeholder="Post-study work visa duration, PR pathway, conditions..." />
                    </Field>
                  </div>
                )}

                {/* ---------------- Country & Education ---------------- */}
                {activeTab === 'academic' && (
                  <div className="space-y-8">
                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Compass className="w-4 h-4 text-primary-600" /> About the Country</p>
                      <Field label="Overview">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.aboutCountry?.overview} onChange={(e) => updateNestedField('aboutCountry.overview', e.target.value)} placeholder="A general introduction to studying in this country..." />
                      </Field>
                      <Field label="History & Government">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.aboutCountry?.historyAndGovernment} onChange={(e) => updateNestedField('aboutCountry.historyAndGovernment', e.target.value)} />
                      </Field>
                      <Field label="Population & Culture">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.aboutCountry?.populationAndCulture} onChange={(e) => updateNestedField('aboutCountry.populationAndCulture', e.target.value)} />
                      </Field>
                      <Field label="Geography & Climate">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.aboutCountry?.geographyAndClimate} onChange={(e) => updateNestedField('aboutCountry.geographyAndClimate', e.target.value)} />
                      </Field>
                    </div>

                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-600" /> Education System</p>
                      <Field label="Overview" hint="How the education system is structured, at a high level.">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.educationSystem?.overview} onChange={(e) => updateNestedField('educationSystem.overview', e.target.value)} />
                      </Field>
                      <Field label="Levels of Study" hint="Bachelor's, Master's, PhD structure and typical durations.">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.educationSystem?.levelsOfStudy} onChange={(e) => updateNestedField('educationSystem.levelsOfStudy', e.target.value)} />
                      </Field>
                      <Field label="Degree Recognition & Accreditation">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.educationSystem?.degreeRecognition} onChange={(e) => updateNestedField('educationSystem.degreeRecognition', e.target.value)} />
                      </Field>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary-600" /> Types of Institutions</p>
                        <AddButton onClick={() => addDynamicItem('institutionTypes', { name: '', description: '', bestFor: '', admissions: '' })}>Add Institution Type</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.institutionTypes?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('institutionTypes', index)}>
                            <Field label="Name"><input className={inputCls} value={item.name} onChange={(e) => updateDynamicItem('institutionTypes', index, { name: e.target.value })} placeholder="Public Universities" /></Field>
                            <Field label="Best For"><input className={inputCls} value={item.bestFor} onChange={(e) => updateDynamicItem('institutionTypes', index, { bestFor: e.target.value })} placeholder="Research-focused students" /></Field>
                            <div className="md:col-span-2">
                              <Field label="Description"><textarea className={`${inputCls} h-16 resize-none`} value={item.description} onChange={(e) => updateDynamicItem('institutionTypes', index, { description: e.target.value })} /></Field>
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Admissions"><textarea className={`${inputCls} h-16 resize-none`} value={item.admissions} onChange={(e) => updateDynamicItem('institutionTypes', index, { admissions: e.target.value })} placeholder="How admission works for this type of institution..." /></Field>
                            </div>
                          </RepeatingCard>
                        ))}
                        {!form.institutionTypes?.length && <p className="text-xs text-ink-400 italic">No institution types added yet.</p>}
                      </div>
                    </div>

                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Compass className="w-4 h-4 text-primary-600" /> Vocational Education</p>
                      <Field label="Overview">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.vocationalEducation?.overview} onChange={(e) => updateNestedField('vocationalEducation.overview', e.target.value)} placeholder="How vocational and technical training works in this country..." />
                      </Field>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Compass className="w-4 h-4 text-secondary-600" /> Vocational Programs</p>
                        <AddButton onClick={() => addDynamicItem('vocationalPrograms', { name: '', description: '' })}>Add Program</AddButton>
                      </div>
                      <div className="space-y-3">
                        {form.vocationalPrograms?.map((item, index) => (
                          <RepeatingCard key={index} index={index} onRemove={() => removeDynamicItem('vocationalPrograms', index)}>
                            <Field label="Program Name"><input className={inputCls} value={item.name} onChange={(e) => updateDynamicItem('vocationalPrograms', index, { name: e.target.value })} placeholder="BTS (Brevet de Technicien Supérieur)" /></Field>
                            <div className="md:col-span-2">
                              <Field label="Description"><textarea className={`${inputCls} h-16 resize-none`} value={item.description} onChange={(e) => updateDynamicItem('vocationalPrograms', index, { description: e.target.value })} /></Field>
                            </div>
                          </RepeatingCard>
                        ))}
                        {!form.vocationalPrograms?.length && <p className="text-xs text-ink-400 italic">No vocational programs added yet.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- Language & Schools ---------------- */}
                {activeTab === 'language-schools' && (
                  <div className="space-y-8">
                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Languages className="w-4 h-4 text-primary-600" /> Language Learning</p>
                      <Field label="Overview">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.languageLearning?.overview} onChange={(e) => updateNestedField('languageLearning.overview', e.target.value)} />
                      </Field>
                      <Field label="Finding the Right Course">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.languageLearning?.findingCourses} onChange={(e) => updateNestedField('languageLearning.findingCourses', e.target.value)} />
                      </Field>
                      <Field label="Certifications & Diplomas">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.languageLearning?.certifications} onChange={(e) => updateNestedField('languageLearning.certifications', e.target.value)} />
                      </Field>
                      <Field label="Visa for Language Study">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.languageLearning?.visaForLanguageStudy} onChange={(e) => updateNestedField('languageLearning.visaForLanguageStudy', e.target.value)} />
                      </Field>
                    </div>

                    <div className="bg-cream-50 p-4 rounded-2xl border border-ink-100 space-y-4">
                      <p className="text-sm font-bold text-ink-800 flex items-center gap-2"><Info className="w-4 h-4 text-secondary-600" /> Secondary Schools</p>
                      <Field label="Overview">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.overview} onChange={(e) => updateNestedField('secondarySchools.overview', e.target.value)} />
                      </Field>
                      <Field label="School Calendar & Style of Learning">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.schoolCalendarAndStyle} onChange={(e) => updateNestedField('secondarySchools.schoolCalendarAndStyle', e.target.value)} />
                      </Field>
                      <Field label="State, Private & International Schools">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.schoolTypes} onChange={(e) => updateNestedField('secondarySchools.schoolTypes', e.target.value)} />
                      </Field>
                      <Field label="Exchange Programmes & Summer Camps">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.exchangeAndSummerPrograms} onChange={(e) => updateNestedField('secondarySchools.exchangeAndSummerPrograms', e.target.value)} />
                      </Field>
                      <Field label="Visas for Junior Students">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.juniorVisaInfo} onChange={(e) => updateNestedField('secondarySchools.juniorVisaInfo', e.target.value)} />
                      </Field>
                      <Field label="Transition to Higher Education">
                        <textarea className={`${inputCls} h-20 resize-none`} value={form.secondarySchools?.transitionToHigherEd} onChange={(e) => updateNestedField('secondarySchools.transitionToHigherEd', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ---------------- Living Guide ---------------- */}
                {activeTab === 'living' && (
                  <div className="space-y-5">
                    <Field label="Before You Go" hint="Pre-departure prep, packing, documentation, getting to the country.">
                      <textarea className={textareaCls} value={form.livingGuide?.beforeDeparture} onChange={(e) => updateNestedField('livingGuide.beforeDeparture', e.target.value)} />
                    </Field>
                    <Field label="Arrival" hint="First days — registration fees, bank account, visa validation, healthcare registration.">
                      <textarea className={textareaCls} value={form.livingGuide?.arrival} onChange={(e) => updateNestedField('livingGuide.arrival', e.target.value)} />
                    </Field>
                    <Field label="Accommodation" hint="Housing options and how to secure a rental.">
                      <textarea className={textareaCls} value={form.livingGuide?.accommodation} onChange={(e) => updateNestedField('livingGuide.accommodation', e.target.value)} />
                    </Field>
                    <Field label="Money Matters" hint="Currency, banking, taxes, tipping, cards.">
                      <textarea className={textareaCls} value={form.livingGuide?.moneyMatters} onChange={(e) => updateNestedField('livingGuide.moneyMatters', e.target.value)} />
                    </Field>
                    <Field label="Safety" hint="Emergency numbers and general safety guidance.">
                      <textarea className={textareaCls} value={form.livingGuide?.safety} onChange={(e) => updateNestedField('livingGuide.safety', e.target.value)} />
                    </Field>
                    <Field label="Communications" hint="Wifi, mobile plans, phone providers.">
                      <textarea className={textareaCls} value={form.livingGuide?.communications} onChange={(e) => updateNestedField('livingGuide.communications', e.target.value)} />
                    </Field>
                    <Field label="Recreation" hint="Student discounts, culture, sports, things to do.">
                      <textarea className={textareaCls} value={form.livingGuide?.recreation} onChange={(e) => updateNestedField('livingGuide.recreation', e.target.value)} />
                    </Field>
                    <Field label="Adjusting to Life" hint="Etiquette, culture shock, student support networks.">
                      <textarea className={textareaCls} value={form.livingGuide?.adjusting} onChange={(e) => updateNestedField('livingGuide.adjusting', e.target.value)} />
                    </Field>
                  </div>
                )}
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-ink-100 flex justify-end gap-4 bg-cream-50/50 rounded-b-[32px]">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-coral-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-theme-md">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Destination'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDestinationToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete this destination?"
        message="This will permanently delete this destination and its associated country guide. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminDestinations = () => {
  return (
    <DestinationManagement />
  );
};

export default AdminDestinations;
