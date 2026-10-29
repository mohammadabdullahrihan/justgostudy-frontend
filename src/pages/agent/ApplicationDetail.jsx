import { useState } from 'react';
import { X, AlertTriangle, FileText } from 'lucide-react';
import applicationService from '../../services/applicationService';
import { useModalA11y } from '../../hooks/useModalA11y';
import { StatusBadge } from '../../components/dashboard/home/shared';

const ApplicationDetail = ({ application: initialApp, onClose, onUpdated }) => {
  const [app, setApp] = useState(initialApp);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useModalA11y(!!app, onClose);

  if (!app) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setAddingNote(true);
    setError('');
    try {
      const updated = await applicationService.addAgentNote(app._id, note.trim());
      setApp(updated);
      setNote('');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleMarkUnderReview = async () => {
    if (app.status !== 'pending') return;
    setUpdatingStatus(true);
    setError('');
    try {
      const updated = await applicationService.updateApplicationStatus(app._id, 'under_review');
      setApp(updated);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-application-detail-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={modalRef} className="bg-white border border-ink-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-theme-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div>
            <h2 id="agent-application-detail-title" className="font-bold text-ink-900 text-lg font-display">Application Details</h2>
            <p className="text-xs text-ink-500 mt-0.5">ID: {app._id}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 hover:text-ink-700 flex items-center justify-center transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Status + Action */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <StatusBadge status={app.status} uppercase />
            {app.status === 'pending' && (
              <button
                onClick={handleMarkUnderReview}
                disabled={updatingStatus}
                className="text-xs px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all font-semibold disabled:opacity-40"
              >
                {updatingStatus ? 'Updating...' : 'Mark Under Review'}
              </button>
            )}
          </div>

          {/* Student + Course Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-2">Student</h3>
              <p className="text-ink-900 font-semibold text-sm">{app.studentId?.name || 'Unknown'}</p>
              <p className="text-ink-500 text-sm mt-0.5">{app.studentId?.email || '—'}</p>
            </div>
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-2">Course</h3>
              <p className="text-ink-900 font-semibold text-sm">{app.courseId?.name || 'Unknown'}</p>
              <p className="text-ink-500 text-sm mt-0.5">{app.universityId?.name || '—'}</p>
            </div>
          </div>

          {/* Personal Info */}
          {app.personalInfo && (
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Personal Info</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-ink-500">Name</span>
                <span className="text-ink-700">{app.personalInfo.firstName} {app.personalInfo.lastName}</span>
                <span className="text-ink-500">Phone</span>
                <span className="text-ink-700">{app.personalInfo.phone || '—'}</span>
                <span className="text-ink-500">Passport</span>
                <span className="text-ink-700">{app.personalInfo.passportNumber || '—'}</span>
                <span className="text-ink-500">Gender</span>
                <span className="text-ink-700">{app.personalInfo.gender || '—'}</span>
              </div>
            </div>
          )}

          {/* Academic Info */}
          {app.academicInfo && (
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Academic Info</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-ink-500">Qualification</span>
                <span className="text-ink-700">{app.academicInfo.highestQualification}</span>
                <span className="text-ink-500">Institution</span>
                <span className="text-ink-700">{app.academicInfo.institutionName}</span>
                <span className="text-ink-500">CGPA</span>
                <span className="text-ink-700">{app.academicInfo.cgpa}</span>
                <span className="text-ink-500">Passing Year</span>
                <span className="text-ink-700">{app.academicInfo.passingYear}</span>
                <span className="text-ink-500">IELTS</span>
                <span className="text-ink-700">{app.academicInfo.ieltsOverall}</span>
              </div>
            </div>
          )}

          {/* Documents */}
          {app.documents?.length > 0 && (
            <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Documents</h3>
              <ul className="space-y-2">
                {app.documents.map((doc, i) => (
                  <li key={i}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-all">
                      <FileText className="shrink-0" size={16} />
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Agent Notes */}
          <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">
              Agent Notes ({app.agentNotes?.length || 0})
            </h3>
            {app.agentNotes?.length === 0 && (
              <p className="text-ink-500 text-sm mb-3">No notes yet.</p>
            )}
            {app.agentNotes?.map((n, i) => (
              <div key={i} className="border-l-2 border-primary-300 pl-3 mb-3">
                <p className="text-ink-700 text-sm">{n.note}</p>
                <p className="text-xs text-ink-500 mt-1">{n.author} · {new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
              <label htmlFor="agent-review-note" className="sr-only">Add a review note</label>
              <input
                id="agent-review-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a review note..."
                className="form-input flex-1 text-sm"
              />
              <button
                type="submit"
                disabled={addingNote || !note.trim()}
                className="px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-all disabled:opacity-40 shrink-0"
              >
                {addingNote ? 'Adding…' : 'Add'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
