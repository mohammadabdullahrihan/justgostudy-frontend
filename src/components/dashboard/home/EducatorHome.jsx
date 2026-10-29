import { useAuth } from '../../../context/AuthContext';
import { GraduationCap } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   EDUCATOR HOME
   No educator-specific data model/endpoints exist yet, so this is an
   honest placeholder rather than reusing student-scoped stats that
   would return empty/wrong data for this role.
═══════════════════════════════════════════════════════════ */
const EducatorHome = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-4">
        <GraduationCap size={24} className="text-primary-500" />
      </div>
      <h3 className="text-xl font-bold text-ink-900 mb-2">Welcome, {user?.name}</h3>
      <p className="text-sm text-ink-500 max-w-sm">Educator-specific tools are still being built. Reach out to the admin team if you need something in the meantime.</p>
    </div>
  );
};

export default EducatorHome;
