import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, ArrowRight, User, BookOpen, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getStudyProgram } from '../services/studyService';
import uploadService from '../services/uploadService';
import applicationService from '../services/applicationService';
import IntakeCountdownBanner from '../components/destination/IntakeCountdownBanner';
import ScholarshipPromoBanner from '../components/study/ScholarshipPromoBanner';

const ApplyNowPage = () => {
  const { universityId, courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    dateOfBirth: '',
    highestQualification: '',
    cgpa: '',
    ieltsScore: '',
    documents: [],
  });

  const validateStep = (s) => {
    const next = {};
    if (s === 1) {
      if (!formData.firstName.trim()) next.firstName = 'First name is required';
      if (!formData.lastName.trim()) next.lastName = 'Last name is required';
      if (!formData.phone.trim()) next.phone = 'Phone number is required';
      if (!formData.dateOfBirth) next.dateOfBirth = 'Date of birth is required';
      if (!formData.passportNumber.trim()) next.passportNumber = 'Passport number is required';
    } else if (s === 2) {
      if (!formData.highestQualification.trim()) next.highestQualification = 'Highest qualification is required';
      if (!formData.cgpa) next.cgpa = 'CGPA / GPA is required';
      if (!formData.ieltsScore) next.ieltsScore = 'IELTS/TOEFL score is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToStep = (s) => {
    if (validateStep(step)) setStep(s);
  };

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const programRes = await getStudyProgram(courseId);
        setProgram(programRes.data.data);
      } catch (error) {
        toast.error('Failed to load program details');
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [courseId]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading ${type}...`);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { name: type, url: uploadRes.url, publicId: uploadRes.publicId }]
      }));
      toast.success(`${type} uploaded!`, { id: toastId });
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleApplicationSubmit = async () => {
    setSubmitting(true);
    try {
      await applicationService.createApplication({
        universityId,
        courseId,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          passportNumber: formData.passportNumber,
          dateOfBirth: formData.dateOfBirth,
        },
        academicInfo: {
          highestQualification: formData.highestQualification,
          cgpa: Number(formData.cgpa),
          ieltsOverall: Number(formData.ieltsScore),
        },
        documents: formData.documents,
      });
      setStep(4);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {program?.intakeDeadlines?.length > 0 && (
          <IntakeCountdownBanner intakeDeadlines={program.intakeDeadlines} className="mb-8" />
        )}

        {program?.country && <ScholarshipPromoBanner country={program.country} />}

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-ink-200 text-ink-500'
                }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-4 rounded ${step > s ? 'bg-primary-600' : 'bg-ink-200'}`} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-primary-100/50 p-8 md:p-12 border border-ink-100"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">Personal Information</h2>
                  <p className="text-ink-500">Let&apos;s start with your basic details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">First Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.firstName ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Last Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.lastName ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Phone <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.phone ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Date of Birth <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.dateOfBirth ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-rose-500 mt-1">{errors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Passport Number <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.passportNumber ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.passportNumber && <p className="text-xs text-rose-500 mt-1">{errors.passportNumber}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button
                  onClick={() => goToStep(2)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">Academic History</h2>
                  <p className="text-ink-500">Tell us about your education</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-2">Highest Qualification <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.highestQualification}
                    onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                    placeholder="e.g. Higher Secondary / Bachelor"
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.highestQualification ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.highestQualification && <p className="text-xs text-rose-500 mt-1">{errors.highestQualification}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">CGPA / GPA <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.cgpa ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.cgpa && <p className="text-xs text-rose-500 mt-1">{errors.cgpa}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">IELTS/TOEFL Score <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.ieltsScore}
                    onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value })}
                    className={`w-full px-5 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.ieltsScore ? 'border-rose-400' : 'border-gray-200'}`}
                  />
                  {errors.ieltsScore && <p className="text-xs text-rose-500 mt-1">{errors.ieltsScore}</p>}
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-ink-500 font-bold px-8 py-3 hover:text-primary-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">Document Upload</h2>
                  <p className="text-ink-500">Upload required certificates (PDF/Image)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Passport', 'Transcript', 'IELTS Certificate', 'CV'].map((type) => (
                  <div key={type} className="p-6 border-2 border-dashed border-ink-100 rounded-2xl hover:border-primary-200 transition-all group relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-ink-700">{type}</span>
                      {formData.documents.find(d => d.name === type) ? (
                        <CheckCircle className="w-6 h-6 text-secondary-500" />
                      ) : (
                        <Upload className="w-6 h-6 text-ink-500 group-hover:text-primary-500" />
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, type)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-ink-500">Click to upload or drag & drop</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={() => setStep(2)}
                  className="text-ink-500 font-bold px-8 py-3 hover:text-primary-600 transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={submitting}
                  onClick={handleApplicationSubmit}
                  className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-12 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-secondary-50 text-secondary-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-16 h-16" />
              </div>
              <h2 className="text-4xl font-bold text-ink-900 mb-4">Application Success!</h2>
              <p className="text-ink-500 text-lg mb-12 max-w-md mx-auto">
                Your application for <span className="text-primary-600 font-bold">{program?.title}</span> has been received. Our team will review it and contact you soon.
              </p>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ApplyNowPage;
