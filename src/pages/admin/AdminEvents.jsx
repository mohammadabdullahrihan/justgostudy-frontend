import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, CalendarDays, Image as ImageIcon, Upload } from 'lucide-react';
import * as eventService from '../../services/eventService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';

const emptyForm = {
  title: '', description: '', coverImage: '', type: 'webinar', mode: 'online',
  startDateTime: '', endDateTime: '', location: '', registrationLink: '',
  capacity: '', isFeatured: false, status: 'active',
};

const toLocalInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

const EventManagement = () => {
  const { data: events, loading, error, refetch: fetchEvents } = useAdminList(async () => {
    const data = await eventService.getEvents();
    return Array.isArray(data) ? data : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditTarget(event);
      setForm({
        ...event,
        startDateTime: toLocalInput(event.startDateTime),
        endDateTime: toLocalInput(event.endDateTime),
        capacity: event.capacity ?? '',
      });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      setForm(prev => ({ ...prev, coverImage: uploadRes.url || uploadRes.data?.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity === '' ? null : parseInt(form.capacity),
        endDateTime: form.endDateTime || null,
      };
      if (editTarget) {
        await eventService.updateEvent(editTarget._id, payload);
      } else {
        await eventService.createEvent(payload);
      }
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.message || 'Error saving event');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await eventService.deleteEvent(deleteTarget);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error(error.message || 'Error deleting event');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Events &amp; Webinars</h2>
          <p className="text-ink-500 text-sm">Manage upcoming webinars, seminars and education fairs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchEvents} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Event
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : !error && events.length === 0 ? (
          <div className="col-span-full py-16 bg-ink-50 rounded-[32px] border-2 border-dashed border-ink-200">
            <EmptyState icon={CalendarDays} iconClassName="text-ink-200" message="No events scheduled yet.">
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> Add your first event
              </button>
            </EmptyState>
          </div>
        ) : events.map(ev => (
          <div key={ev._id} className="bg-ink-50 rounded-[32px] p-6 border border-ink-100 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(ev)} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteTarget(ev._id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-32 rounded-2xl overflow-hidden bg-white border border-ink-100 mb-4 flex items-center justify-center">
              {ev.coverImage ? <img src={ev.coverImage} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-ink-500" />}
            </div>
            <h4 className="font-bold text-ink-900 pr-8">{ev.title}</h4>
            <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mt-1">{ev.type} · {ev.mode}</p>
            <p className="text-ink-500 text-sm mt-2">{new Date(ev.startDateTime).toLocaleString()}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-200/50">
              <span className="text-sm text-ink-500">{ev.registeredCount}/{ev.capacity ?? '∞'} registered</span>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                ev.status === 'completed' ? 'bg-primary-100 text-primary-600'
                  : ev.status === 'cancelled' ? 'bg-rose-100 text-rose-500'
                  : 'bg-secondary-100 text-secondary-600'
              }`}>
                {ev.status || 'active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit Event' : 'Add Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Title</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Description</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Cover Image</label>
                <div className="flex items-center gap-4">
                  {form.coverImage && <img src={form.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover border border-ink-100" />}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 text-primary-600 animate-spin" /> : <Upload className="w-4 h-4 text-ink-500" />}
                    <span className="text-sm font-semibold text-ink-600">{uploading ? 'Uploading...' : 'Upload Cover'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Event Format</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="webinar">Webinar</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="fair">Education Fair</option>
                  </select>
                  <p className="text-xs text-ink-400">What kind of event this is.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Mode</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  >
                    <option value="online">Online</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Start Date/Time</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.startDateTime}
                    onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">End Date/Time</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.endDateTime}
                    onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Location / Meeting Link</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Registration Link</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.registrationLink}
                    onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Capacity (blank = unlimited)</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Featured</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.value === 'true' })}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Event Status</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active (shows as upcoming)</option>
                    <option value="completed">Completed (event already happened)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <p className="text-xs text-ink-400">Switch to Completed or Cancelled once the event is over.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Event'}
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
        title="Delete this event?"
        message="This will permanently delete this event. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminEvents = () => (
  <EventManagement />
);

export default AdminEvents;
