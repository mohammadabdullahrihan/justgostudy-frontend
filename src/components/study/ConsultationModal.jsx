import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Phone, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createConsultation } from '../../services/studyService';
import * as couponService from '../../services/couponService';

const ConsultationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    country: '',
    level: '',
    message: '',
    couponCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [couponStatus, setCouponStatus] = useState(null); // null | 'checking' | 'valid' | 'invalid'
  const [couponInfo, setCouponInfo] = useState(null);

  const handleCheckCoupon = async () => {
    const code = formData.couponCode.trim();
    if (!code) return;
    setCouponStatus('checking');
    try {
      const coupon = await couponService.validateCoupon(code);
      setCouponInfo(coupon);
      setCouponStatus('valid');
    } catch (error) {
      setCouponInfo(null);
      setCouponStatus('invalid');
    }
  };

  const countries = [
    'USA', 'UK', 'Canada', 'Australia', 'Germany',
    'Sweden', 'Finland', 'Malaysia', 'Turkey', 'Other'
  ];

  const levels = [
    'Bachelor', 'Master', 'PhD', 'Diploma', 'Foundation'
  ];

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createConsultation(formData);
      toast.success('Your consultation request has been sent!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', country: '', level: '', message: '', couponCode: '' });
      setCouponStatus(null);
      setCouponInfo(null);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Portaled to <body>: the page-transition wrapper in StudyAbroadLayout
  // (and Lenis) leave a transform on an ancestor, which turns `position: fixed`
  // into "fixed to that ancestor" instead of the viewport — escape it here,
  // same as MeetTheTeam's modal.
  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Talk to a Counselor
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleConsultationSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="+880 1XXX XXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Master's in Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Country</label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Level</label>
              <div className="flex flex-wrap gap-2">
                {levels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, level })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.level === level
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows="3"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Tell us about your study goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon / Referral Code (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => {
                    setFormData({ ...formData, couponCode: e.target.value.toUpperCase() });
                    setCouponStatus(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase"
                  placeholder="e.g. WELCOME500"
                />
                <button
                  type="button"
                  onClick={handleCheckCoupon}
                  disabled={!formData.couponCode.trim() || couponStatus === 'checking'}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-primary-300 disabled:opacity-50 transition-all"
                >
                  {couponStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponStatus === 'valid' && couponInfo && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-secondary-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Applied — {couponInfo.discountType === 'percentage' ? `${couponInfo.discountValue}% off` : `৳${couponInfo.discountValue} off`}
                </p>
              )}
              {couponStatus === 'invalid' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                  <XCircle className="w-3.5 h-3.5" />
                  Invalid or expired code
                </p>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ConsultationModal;
