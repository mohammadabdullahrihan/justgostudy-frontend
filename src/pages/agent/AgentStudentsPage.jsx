import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import agentService from '../../services/agentService';
import { Users, RotateCcw, Search, Mail, Phone, MapPin } from 'lucide-react';

const AgentStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await agentService.getAssignedStudents();
      setStudents(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Failed to load your assigned students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const haystack = [s.user?.name, s.user?.email, s.phone].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [students, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">My Students</h2>
          <p className="text-sm text-ink-500 mt-0.5">{filteredStudents.length} of {students.length} assigned students</p>
        </div>
        <button onClick={fetchStudents} className="text-sm text-coral-500 font-semibold hover:underline flex items-center gap-1 shrink-0">
          <RotateCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-ink-100/70 rounded-xl text-ink-900 placeholder-ink-400 outline-none focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10 transition-all"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white border border-ink-100/70 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm">
          <Users className="w-12 h-12 mb-4 mx-auto text-ink-200" />
          <h3 className="text-lg font-bold text-ink-900">No students found</h3>
          <p className="text-ink-500 mt-1">
            {students.length === 0
              ? 'Students assigned to you by an admin will appear here.'
              : 'Try changing your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((s) => (
            <div key={s._id} className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
                  {s.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900 truncate">{s.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-ink-500 flex items-center gap-1 truncate">
                    <Mail size={13} className="shrink-0" /> {s.user?.email || '—'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-500 mb-3">
                {s.phone && (
                  <span className="flex items-center gap-1"><Phone size={13} /> {s.phone}</span>
                )}
                {s.desiredCountry?.length > 0 && (
                  <span className="flex items-center gap-1"><MapPin size={13} /> {s.desiredCountry.join(', ')}</span>
                )}
              </div>
              <Link
                to="/agent/applications"
                className="text-xs font-bold px-3 py-1.5 bg-coral-50 text-coral-500 border border-coral-200 rounded-lg hover:bg-coral-100 transition-all inline-block"
              >
                View Applications
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentStudentsPage;
