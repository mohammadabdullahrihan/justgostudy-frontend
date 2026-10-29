import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileDown, Download, Loader2, CheckCircle2 } from 'lucide-react';
import * as leadMagnetService from '../../services/leadMagnetService';

/* Sidebar widget: shows the newest active lead magnet, captures
   name+email, triggers the delivery email, and opens the file. */
const LeadMagnetWidget = () => {
  const [magnet, setMagnet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [delivered, setDelivered] = useState(null);

  useEffect(() => {
    let ignore = false;
    leadMagnetService
      .getLeadMagnets({ activeOnly: true })
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) setMagnet(data[0]);
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setSubmitting(true);
    try {
      const res = await leadMagnetService.downloadLeadMagnet(magnet._id, form);
      setDelivered(res.fileUrl);
      window.open(res.fileUrl, '_blank', 'noopener,noreferrer');
      toast.success("You're in! Check your inbox — the guide is on its way too.");
    } catch (error) {
      toast.error(error.message || 'Could not process your download, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !magnet) return null;

  return (
    <div className="bg-ink-50 p-8 rounded-3xl">
      {magnet.coverImage && (
        <img
          src={magnet.coverImage}
          alt={magnet.title}
          className="w-full h-36 object-cover rounded-2xl mb-6 shadow-sm"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="flex items-center gap-2 mb-3 text-primary-600">
        <FileDown className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Free {magnet.category}</span>
      </div>
      <h3 className="text-xl font-bold text-ink-900 mb-2 leading-tight">{magnet.title}</h3>
      {magnet.description && (
        <p className="text-ink-500 text-sm mb-6 leading-relaxed">{magnet.description}</p>
      )}

      {delivered ? (
        <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-ink-900">Sent!</p>
            <a href={delivered} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">
              Download again
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            aria-label="Your name"
            className="w-full px-5 py-3.5 bg-white rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-sm"
          />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="Your email"
            aria-label="Your email"
            className="w-full px-5 py-3.5 bg-white rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {submitting ? 'Sending...' : 'Get Free Download'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LeadMagnetWidget;
