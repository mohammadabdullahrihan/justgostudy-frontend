import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Star, Loader2, Image as ImageIcon, RotateCcw, Upload } from 'lucide-react';
import * as studyService from '../../services/studyService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const emptyForm = {
    studentName: '', country: '', university: '', quote: '', image: '', isActive: true, order: 0
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const testimonialsRes = await studyService.getTestimonials();
      // Handle both cases: if testimonialsRes is array directly or object with testimonials property
      const testimonialsData = Array.isArray(testimonialsRes) ? testimonialsRes : (testimonialsRes.testimonials || testimonialsRes.data || []);
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (test = null) => {
    if (test) {
      setEditTarget(test);
      setForm({ ...test });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await studyService.updateTestimonial(editTarget._id, form);
      } else {
        await studyService.createTestimonial(form);
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || 'Error saving testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      const imageUrl = uploadRes.url || uploadRes.data?.url;
      setForm(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await studyService.deleteTestimonial(deleteTarget);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || 'Error deleting testimonial');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Student Testimonials</h2>
          <p className="text-ink-600 text-sm">Manage success stories and quotes from students.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTestimonials} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Testimonial
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(test => (
            <div key={test._id} className="bg-ink-50 rounded-[32px] p-6 border border-ink-100 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(test)} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(test._id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-theme-sm bg-white flex items-center justify-center">
                  {test.image ? (
                    <img src={test.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-ink-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">{test.studentName}</h4>
                  <p className="text-xs text-primary-600 font-bold uppercase tracking-wide">{test.university}</p>
                </div>
              </div>

              <p className="text-ink-700 text-sm leading-relaxed mb-6">&quot;{test.quote}&quot;</p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-ink-200/50">
                <span className="text-xs font-bold text-ink-600 flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-accent-400 text-accent-400" /> {test.country}
                </span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${test.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                  {test.isActive ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="col-span-full text-center py-20 bg-ink-50 rounded-[32px] border-2 border-dashed border-ink-200">
              <p className="text-ink-600 font-medium">No testimonials found. Add your first success story!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900">{editTarget ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-600 uppercase">Student Name</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.studentName}
                    onChange={(e) => setForm({...form, studentName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-600 uppercase">Country</label>
                    <input
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                      value={form.country}
                      onChange={(e) => setForm({...form, country: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-600 uppercase">University</label>
                    <input
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                      value={form.university}
                      onChange={(e) => setForm({...form, university: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-600 uppercase">Quote</label>
                  <textarea
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-24"
                    value={form.quote}
                    onChange={(e) => setForm({...form, quote: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-600 uppercase">Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-ink-100 bg-ink-50 flex items-center justify-center shrink-0">
                      {form.image ? (
                        <img src={form.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-ink-500" />
                      )}
                    </div>
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-ink-500" />
                      )}
                      <span className="text-sm font-semibold text-ink-600">
                        {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium text-sm"
                    placeholder="Or paste an image URL"
                    value={form.image}
                    onChange={(e) => setForm({...form, image: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-600 uppercase">Display Order</label>
                    <input
                      type="number"
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                      value={form.order}
                      onChange={(e) => setForm({...form, order: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-ink-400">Lower numbers show first (1, 2, 3...).</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-600 uppercase">Show on Website?</label>
                    <select
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                      value={form.isActive}
                      onChange={(e) => setForm({...form, isActive: e.target.value === 'true'})}
                    >
                      <option value="true">Visible (students can see it)</option>
                      <option value="false">Hidden (not shown yet)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this testimonial?"
        message="This will permanently delete this testimonial. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminTestimonials = () => {
  return (
    <TestimonialManagement />
  );
};

export default AdminTestimonials;
