import { useAuth } from '../../context/AuthContext';
import StudentHome from './home/StudentHome';
import UniversityHome from './home/UniversityHome';
import AgentHome from './home/AgentHome';
import AdminHome from './home/AdminHome';
import EducatorHome from './home/EducatorHome';

const DashboardHome = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'admin' || role === 'super_admin' || role === 'developer') return <AdminHome />;
  if (role === 'agent') return <AgentHome />;
  if (role === 'university') return <UniversityHome />;
  if (role === 'educator') return <EducatorHome />;
  return <StudentHome />;
};

export default DashboardHome;
