import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import applicationService from '../../services/applicationService';
import userService from '../../services/userService';
import agentService from '../../services/agentService';
import {
  House, FileText, BookOpen, Building2, Star, Book, CircleUser,
  Briefcase, Users, Inbox, CalendarCheck, GraduationCap, FilePen,
  FolderOpen, Trophy, Plane, MapPin, MessageCircle, Calculator, Globe,
  Headphones, ArrowLeft, Menu, Search, Clock, Bell, BellOff, HelpCircle,
  ChevronDown, ChevronLeft, ChevronRight, LogOut, RotateCcw, Trash2, XCircle, CheckCircle, UserPlus, UserCheck,
  Image, Layers, Languages, Megaphone, PictureInPicture2, Ticket, Users2,
  CalendarDays, FileDown, ListChecks, LineChart, IdCard, Lightbulb, Activity,
} from 'lucide-react';

const iconMap = {
  'fa-solid fa-house-chimney': House,
  'fa-solid fa-file-lines': FileText,
  'fa-solid fa-book-open': BookOpen,
  'fa-solid fa-building-columns': Building2,
  'fa-solid fa-star': Star,
  'fa-solid fa-book': Book,
  'fa-solid fa-circle-user': CircleUser,
  'fa-solid fa-briefcase': Briefcase,
  'fa-solid fa-users': Users,
  'fa-solid fa-inbox': Inbox,
  'fa-solid fa-calendar-check': CalendarCheck,
  'fa-solid fa-graduation-cap': GraduationCap,
  'fa-solid fa-file-pen': FilePen,
  'fa-solid fa-folder-open': FolderOpen,
  'fa-solid fa-trophy': Trophy,
  'fa-solid fa-plane-departure': Plane,
  'fa-solid fa-map-location-dot': MapPin,
  'fa-solid fa-comments': MessageCircle,
  'fa-solid fa-calculator': Calculator,
  'fa-solid fa-earth-americas': Globe,
  'fa-solid fa-headset': Headphones,
  'fa-solid fa-file-circle-exclamation': FileText,
  'fa-solid fa-user-clock': UserCheck,
  'fa-solid fa-circle-check': CheckCircle,
  'fa-solid fa-circle-xmark': XCircle,
  'fa-solid fa-user-plus': UserPlus,
  'fa-solid fa-magnifying-glass': Search,
  'fa-regular fa-clock': Clock,
  'fa-solid fa-clock': Clock,
  'fa-solid fa-bell': Bell,
  'fa-regular fa-bell': Bell,
  'fa-solid fa-rotate-right': RotateCcw,
  'fa-regular fa-bell-slash': BellOff,
  'fa-regular fa-circle-question': HelpCircle,
  'fa-solid fa-chevron-down': ChevronDown,
  'fa-solid fa-bars': Menu,
  'fa-solid fa-arrow-left': ArrowLeft,
  'fa-solid fa-arrow-right-from-bracket': LogOut,
  'fa-solid fa-house': House,
  'fa-solid fa-globe': Globe,
  'fa-solid fa-envelope': MessageCircle,
  'fa-solid fa-image': Image,
  'fa-solid fa-layer-group': Layers,
  'fa-solid fa-language': Languages,
  'fa-solid fa-bullhorn': Megaphone,
  'fa-regular fa-window-restore': PictureInPicture2,
  'fa-solid fa-circle-question': HelpCircle,
  'fa-solid fa-ticket': Ticket,
  'fa-solid fa-people-arrows': Users2,
  'fa-solid fa-calendar-days': CalendarDays,
  'fa-solid fa-file-arrow-down': FileDown,
  'fa-solid fa-list-check': ListChecks,
  'fa-solid fa-chart-line': LineChart,
  'fa-solid fa-passport': IdCard,
  'fa-solid fa-lightbulb': Lightbulb,
  'fa-solid fa-wave-square': Activity,
};

const Icon = ({ icon, className = '' }) => {
  const LucideIcon = iconMap[icon];
  if (!LucideIcon) return <span className={className} />;
  return <LucideIcon className={className} />;
};

const ROLE_NAV = {
  student: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/student/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
        { label: 'My Applications', to: '/student/applications', icon: 'fa-solid fa-file-lines' },
        { label: 'Browse Courses', to: '/study-abroad/courses', icon: 'fa-solid fa-book-open' },
        { label: 'Universities', to: '/study-abroad/universities', icon: 'fa-solid fa-building-columns' },
        { label: 'Favorites', to: '/student/favorites', icon: 'fa-solid fa-star' },
        { label: 'News & Vlogs', to: '/student-resources', icon: 'fa-solid fa-book' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'My Profile', to: '/student/profile', icon: 'fa-solid fa-circle-user' },
        { label: 'Student Guide', to: '/student/guide', icon: 'fa-regular fa-circle-question' },
        { label: 'Help Desk', to: '/contact', icon: 'fa-solid fa-headset' },
      ],
    },
  ],
  agent: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/agent/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
        { label: 'Applications', to: '/agent/applications', icon: 'fa-solid fa-briefcase' },
        { label: 'My Students', to: '/agent/students', icon: 'fa-solid fa-users' },
        { label: 'Courses', to: '/study-abroad/courses', icon: 'fa-solid fa-book-open' },
        { label: 'Universities', to: '/study-abroad/universities', icon: 'fa-solid fa-building-columns' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'My Profile', to: '/agent/profile', icon: 'fa-solid fa-circle-user' },
        { label: 'Agent Guide', to: '/agent/guide', icon: 'fa-regular fa-circle-question' },
        { label: 'Help Desk', to: '/contact', icon: 'fa-solid fa-headset' },
      ],
    },
  ],
  admin: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/admin/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
        { label: 'Applications', to: '/admin/applications', icon: 'fa-solid fa-inbox' },
        { label: 'Appointments', to: '/admin/appointments', icon: 'fa-solid fa-calendar-check' },
        { label: 'Consultations', to: '/admin/consultations', icon: 'fa-solid fa-comments' },
        { label: 'Users', to: '/admin/users', icon: 'fa-solid fa-users' },
      ],
    },
    {
      section: 'Academic Data',
      items: [
        { label: 'Universities', to: '/admin/universities', icon: 'fa-solid fa-building-columns' },
        { label: 'Courses', to: '/admin/courses', icon: 'fa-solid fa-graduation-cap' },
        { label: 'Study Abroad', to: '/admin/study-abroad', icon: 'fa-solid fa-plane-departure' },
        { label: 'Destinations', to: '/admin/destinations', icon: 'fa-solid fa-earth-americas' },
      ],
    },
    {
      section: 'Content & Marketing',
      items: [
        { label: 'News & Vlogs', to: '/admin/resources', icon: 'fa-solid fa-file-pen' },
        { label: 'Success Stories', to: '/admin/success', icon: 'fa-solid fa-trophy' },
        { label: 'Testimonials', to: '/admin/testimonials', icon: 'fa-solid fa-comments' },
        { label: 'Newsletter', to: '/admin/newsletter', icon: 'fa-solid fa-envelope' },
        { label: 'Banners', to: '/admin/banners', icon: 'fa-solid fa-bullhorn' },
        { label: 'Popup Campaigns', to: '/admin/popups', icon: 'fa-regular fa-window-restore' },
        { label: 'FAQs', to: '/admin/faqs', icon: 'fa-solid fa-circle-question' },
        { label: 'Coupons', to: '/admin/coupons', icon: 'fa-solid fa-ticket' },
        { label: 'Referrals', to: '/admin/referrals', icon: 'fa-solid fa-people-arrows' },
        { label: 'Events & Webinars', to: '/admin/events', icon: 'fa-solid fa-calendar-days' },
        { label: 'SEO Meta', to: '/admin/seo-meta', icon: 'fa-solid fa-magnifying-glass' },
        { label: 'Lead Magnets', to: '/admin/lead-magnets', icon: 'fa-solid fa-file-arrow-down' },
        { label: 'Quiz Leads', to: '/admin/quiz-leads', icon: 'fa-solid fa-list-check' },
        { label: 'Marketing Analytics', to: '/admin/marketing-analytics', icon: 'fa-solid fa-chart-line' },
      ],
    },
    {
      section: 'Tools',
      items: [
        { label: 'Calculator Defaults', to: '/admin/calculator-defaults', icon: 'fa-solid fa-calculator' },
        { label: 'Flashcards', to: '/admin/flashcards', icon: 'fa-solid fa-layer-group' },
        { label: 'Exam Prep', to: '/admin/exam-prep', icon: 'fa-solid fa-passport' },
        { label: 'Manage Tabs', to: '/admin/tabs', icon: 'fa-solid fa-file-lines' },
        { label: 'Language Club', to: '/admin/language-club', icon: 'fa-solid fa-language' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'My Profile', to: '/admin/profile', icon: 'fa-solid fa-circle-user' },
      ],
    },
    {
      section: 'General',
      items: [
        { label: 'Admin Guide', to: '/admin/guide', icon: 'fa-solid fa-book' },
        { label: 'Request a Feature', to: '/admin/feature-requests', icon: 'fa-solid fa-lightbulb' },
        { label: 'Help Desk', to: '/contact', icon: 'fa-solid fa-headset' },
      ],
    },
  ],
  super_admin: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/super-admin/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
        // Owner-only platform-wide activity monitor — distinct from the
        // "Recent Activity" widget on the Home dashboard (that one's a
        // client-derived, 8-item preview; this is the full, filterable log).
        { label: 'Activities', to: '/super-admin/activities', icon: 'fa-solid fa-wave-square' },
        { label: 'Applications', to: '/super-admin/applications', icon: 'fa-solid fa-inbox' },
        { label: 'Appointments', to: '/super-admin/appointments', icon: 'fa-solid fa-calendar-check' },
        { label: 'Consultations', to: '/super-admin/consultations', icon: 'fa-solid fa-comments' },
        { label: 'Users', to: '/super-admin/users', icon: 'fa-solid fa-users' },
      ],
    },
    {
      section: 'Academic Data',
      items: [
        { label: 'Universities', to: '/super-admin/universities', icon: 'fa-solid fa-building-columns' },
        { label: 'Courses', to: '/super-admin/courses', icon: 'fa-solid fa-graduation-cap' },
        { label: 'Study Abroad', to: '/super-admin/study-abroad', icon: 'fa-solid fa-plane-departure' },
        { label: 'Destinations', to: '/super-admin/destinations', icon: 'fa-solid fa-earth-americas' },
      ],
    },
    {
      section: 'Content & Marketing',
      items: [
        { label: 'News & Vlogs', to: '/super-admin/resources', icon: 'fa-solid fa-file-pen' },
        { label: 'Success Stories', to: '/super-admin/success', icon: 'fa-solid fa-trophy' },
        { label: 'Testimonials', to: '/super-admin/testimonials', icon: 'fa-solid fa-comments' },
        { label: 'Newsletter', to: '/super-admin/newsletter', icon: 'fa-solid fa-envelope' },
        { label: 'Banners', to: '/super-admin/banners', icon: 'fa-solid fa-bullhorn' },
        { label: 'Popup Campaigns', to: '/super-admin/popups', icon: 'fa-regular fa-window-restore' },
        { label: 'FAQs', to: '/super-admin/faqs', icon: 'fa-solid fa-circle-question' },
        { label: 'Coupons', to: '/super-admin/coupons', icon: 'fa-solid fa-ticket' },
        { label: 'Referrals', to: '/super-admin/referrals', icon: 'fa-solid fa-people-arrows' },
        { label: 'Events & Webinars', to: '/super-admin/events', icon: 'fa-solid fa-calendar-days' },
        { label: 'SEO Meta', to: '/super-admin/seo-meta', icon: 'fa-solid fa-magnifying-glass' },
        { label: 'Lead Magnets', to: '/super-admin/lead-magnets', icon: 'fa-solid fa-file-arrow-down' },
        { label: 'Quiz Leads', to: '/super-admin/quiz-leads', icon: 'fa-solid fa-list-check' },
        { label: 'Marketing Analytics', to: '/super-admin/marketing-analytics', icon: 'fa-solid fa-chart-line' },
      ],
    },
    {
      section: 'Tools',
      items: [
        { label: 'Calculator Defaults', to: '/super-admin/calculator-defaults', icon: 'fa-solid fa-calculator' },
        { label: 'Flashcards', to: '/super-admin/flashcards', icon: 'fa-solid fa-layer-group' },
        { label: 'Exam Prep', to: '/super-admin/exam-prep', icon: 'fa-solid fa-passport' },
        { label: 'Manage Tabs', to: '/super-admin/tabs', icon: 'fa-solid fa-file-lines' },
        { label: 'Language Club', to: '/super-admin/language-club', icon: 'fa-solid fa-language' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'My Profile', to: '/admin/profile', icon: 'fa-solid fa-circle-user' },
      ],
    },
    {
      section: 'General',
      items: [
        { label: 'Super Admin Guide', to: '/super-admin/guide', icon: 'fa-solid fa-book' },
        { label: 'Request a Feature', to: '/super-admin/feature-requests', icon: 'fa-solid fa-lightbulb' },
        { label: 'Help Desk', to: '/contact', icon: 'fa-solid fa-headset' },
      ],
    },
  ],
  university: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/university/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
        { label: 'Applications', to: '/university/applications', icon: 'fa-solid fa-file-lines' },
        { label: 'Our Courses', to: '/university/courses', icon: 'fa-solid fa-graduation-cap' },
        { label: 'Browse All', to: '/study-abroad/courses', icon: 'fa-solid fa-book-open' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'University Profile', to: '/university/profile', icon: 'fa-solid fa-building-columns' },
        { label: 'University Guide', to: '/university/guide', icon: 'fa-regular fa-circle-question' },
        { label: 'Help Desk', to: '/contact', icon: 'fa-solid fa-headset' },
      ],
    },
  ],
  educator: [
    {
      section: 'Menu',
      items: [
        { label: 'Home', to: '/educator/dashboard', icon: 'fa-solid fa-house-chimney', exact: true },
      ],
    },
  ],
};

// 'developer' is a full alias for 'super_admin' — same sidebar, same power —
// but every page is mirrored under its own /developer/... URL (see App.jsx)
// so the address bar always says "developer", not "super-admin". Two labels
// also change: "Request a Feature" becomes "Requests" (a developer is who
// those requests go TO, not someone submitting them) and "Super Admin
// Guide" becomes "Developer Guide" (its content correctly says "Developer"
// throughout — see guideChapters.js).
const DEVELOPER_LABEL_OVERRIDES = {
  'Request a Feature': { label: 'Requests', to: '/developer/requests' },
  'Super Admin Guide': { label: 'Developer Guide' },
};
ROLE_NAV.developer = ROLE_NAV.super_admin.map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const override = DEVELOPER_LABEL_OVERRIDES[item.label];
    // Blanket-swap the /super-admin prefix to /developer first (matches the
    // mirrored routes in App.jsx 1:1), then layer on any label/path override.
    const to = item.to.startsWith('/super-admin') ? item.to.replace('/super-admin', '/developer') : item.to;
    return { ...item, to, ...override };
  }),
}));

const ROLE_LABELS = {
  student: 'Student',
  agent: 'Agent',
  university: 'University',
  admin: 'Admin',
  super_admin: 'Super Admin',
  developer: 'Developer',
  educator: 'Educator',
};

/* ─── Live Clock (BST) ───────────────────────────────────── */
const useBSTClock = () => {
  const [time, setTime] = useState(() => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

/* ─── Notification helpers ───────────────────────────────── */
const NOTIF_STORAGE_KEY = (userId) => `jt_notifs_read_${userId}`;
const NOTIF_CLEARED_STORAGE_KEY = (userId) => `jt_notifs_cleared_${userId}`;

const getReadIds = (userId) => {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY(userId)) || '[]')); }
  catch { return new Set(); }
};

const saveReadIds = (userId, ids) => {
  try { localStorage.setItem(NOTIF_STORAGE_KEY(userId), JSON.stringify([...ids])); } catch { /* storage unavailable, ignore */ }
};

const getClearedIds = (userId) => {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_CLEARED_STORAGE_KEY(userId)) || '[]')); }
  catch { return new Set(); }
};

const saveClearedIds = (userId, ids) => {
  try { localStorage.setItem(NOTIF_CLEARED_STORAGE_KEY(userId), JSON.stringify([...ids])); } catch { /* storage unavailable, ignore */ }
};

/* Module-level cache: survives DashboardLayout remounting on every route
   change (each dashboard page mounts its own <DashboardLayout>), so
   navigating between pages doesn't re-fire the notification API calls. */
const notifCache = { key: null, notifications: null, fetchedAt: 0 };
const NOTIF_CACHE_TTL = 60 * 1000;

const SIDEBAR_COLLAPSE_KEY = 'dashboard_sidebar_collapsed';

/* ─── DashboardLayout ─────────────────────────────────────── */
const DashboardLayout = ({ children, hideBreadcrumb }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const bstTime = useBSTClock();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1'; } catch { return false; }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const sidebarNavRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => getReadIds(user?._id));
  const [clearedIds, setClearedIds] = useState(() => getClearedIds(user?._id));

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0'); } catch { /* storage unavailable, ignore */ }
      return next;
    });
  };

  // Save sidebar scroll position when navigating away
  const handleBeforeNavigate = () => {
    if (sidebarNavRef.current) {
      try { localStorage.setItem('dashboard_sidebar_scroll', sidebarNavRef.current.scrollTop); } catch { /* storage unavailable, ignore */ }
    }
  };

  // Restore sidebar scroll position after navigation
  useEffect(() => {
    let savedScroll = null;
    try { savedScroll = localStorage.getItem('dashboard_sidebar_scroll'); } catch { /* storage unavailable, ignore */ }
    if (sidebarNavRef.current && savedScroll) {
      sidebarNavRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const role = user?.role || 'student';
  const navGroups = ROLE_NAV[role] || ROLE_NAV.student;
  const adminPrefix = role === 'developer' ? '/developer' : role === 'super_admin' ? '/super-admin' : '/admin';

  /* ── Build notifications list ──
     A few dashboard routes (e.g. the admin+super_admin combo pages) still
     mount their own <DashboardLayout> outside the shared layout route, so
     this can still remount on navigation between those. `force` bypasses
     the cache for manual refreshes; everything else reuses the cached
     result within TTL. */
  const buildNotifications = useCallback(async (force = false) => {
    const cacheKey = `${role}:${user?._id}`;
    if (
      !force &&
      notifCache.key === cacheKey &&
      notifCache.notifications &&
      Date.now() - notifCache.fetchedAt < NOTIF_CACHE_TTL
    ) {
      setNotifications(notifCache.notifications);
      return;
    }

    setNotifLoading(true);
    try {
      const notifs = [];

      if (role === 'admin' || role === 'super_admin' || role === 'developer') {
        const [apps, usersRes, agentProfilesRaw] = await Promise.all([
          applicationService.getAllApplications(),
          userService.getUsers({ limit: 10000 }),
          agentService.getAllAgents(),
        ]);
        const users = Array.isArray(usersRes) ? usersRes : (usersRes?.users || []);

        /* pending applications */
        const pendingApps = apps.filter((a) => a.status === 'pending');
        pendingApps.slice(0, 10).forEach((a) =>
          notifs.push({
            id: `app_pending_${a._id}`,
            icon: 'fa-solid fa-file-circle-exclamation',
            color: 'bg-accent-50 text-accent-600',
            title: 'New Application Pending',
            body: `${a.studentId?.name || 'A student'} applied for ${a.courseId?.name || 'a course'}`,
            time: a.createdAt,
            link: `${adminPrefix}/applications`,
          })
        );

        /* pending agent approvals (single batch call, not one request per agent) */
        const agentProfiles = agentProfilesRaw.map((p) => ({ ...p, userInfo: p.user }));
        const pendingAgentList = agentProfiles.filter((p) => p.status === 'pending');
        pendingAgentList.forEach((a) =>
          notifs.push({
            id: `agent_pending_${a.userInfo._id}`,
            icon: 'fa-solid fa-user-clock',
            color: 'bg-coral-50 text-coral-600',
            title: 'Agent Awaiting Approval',
            body: `${a.userInfo.name} (${a.userInfo.email}) needs review`,
            time: a.userInfo.createdAt,
            link: `${adminPrefix}/users`,
          })
        );

        /* recently accepted/rejected (last 5) */
        apps
          .filter((a) => a.status === 'accepted' || a.status === 'rejected')
          .slice(0, 5)
          .forEach((a) =>
            notifs.push({
              id: `app_done_${a._id}`,
              icon: a.status === 'accepted' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
              color: a.status === 'accepted' ? 'bg-secondary-50 text-secondary-600' : 'bg-rose-50 text-rose-500',
              title: `Application ${a.status === 'accepted' ? 'Accepted' : 'Rejected'}`,
              body: `${a.studentId?.name || 'Student'}, ${a.courseId?.name || 'Course'}`,
              time: a.updatedAt || a.createdAt,
              link: `${adminPrefix}/applications`,
            })
          );

        /* new registrations (last 5 users) */
        users.slice(0, 5).forEach((u) =>
          notifs.push({
            id: `user_reg_${u._id}`,
            icon: 'fa-solid fa-user-plus',
            color: 'bg-primary-50 text-primary-500',
            title: 'New Registration',
            body: `${u.name} joined as ${u.role}`,
            time: u.createdAt,
            link: `${adminPrefix}/users`,
          })
        );

      } else if (role === 'agent') {
        const appsRes = await applicationService.getAgentApplications();
        const apps = Array.isArray(appsRes?.data || appsRes) ? (appsRes?.data || appsRes) : [];
        apps.filter((a) => a.status === 'pending').slice(0, 8).forEach((a) =>
          notifs.push({
            id: `agent_app_pending_${a._id}`,
            icon: 'fa-solid fa-file-circle-exclamation',
            color: 'bg-accent-50 text-accent-600',
            title: 'Application Needs Review',
            body: `${a.studentId?.name || 'Student'}, ${a.courseId?.name || 'Course'}`,
            time: a.createdAt,
            link: '/agent/applications',
          })
        );
        apps.filter((a) => a.status === 'accepted' || a.status === 'rejected').slice(0, 5).forEach((a) =>
          notifs.push({
            id: `agent_app_done_${a._id}`,
            icon: a.status === 'accepted' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
            color: a.status === 'accepted' ? 'bg-secondary-50 text-secondary-600' : 'bg-rose-50 text-rose-500',
            title: `Application ${a.status === 'accepted' ? 'Accepted' : 'Rejected'}`,
            body: `${a.studentId?.name || 'Student'}, ${a.courseId?.name || 'Course'}`,
            time: a.updatedAt || a.createdAt,
            link: '/agent/applications',
          })
        );

      } else {
        /* student */
        const appsRes = await applicationService.getMyApplications();
        const apps = Array.isArray(appsRes?.data || appsRes) ? (appsRes?.data || appsRes) : [];
        apps.forEach((a) =>
          notifs.push({
            id: `student_app_${a._id}`,
            icon: a.status === 'accepted'
              ? 'fa-solid fa-circle-check'
              : a.status === 'rejected'
                ? 'fa-solid fa-circle-xmark'
                : a.status === 'under_review'
                  ? 'fa-solid fa-magnifying-glass'
                  : 'fa-solid fa-clock',
            color: a.status === 'accepted'
              ? 'bg-secondary-50 text-secondary-600'
              : a.status === 'rejected'
                ? 'bg-rose-50 text-rose-500'
                : a.status === 'under_review'
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-accent-50 text-accent-600',
            title: `Application ${a.status?.replace('_', ' ')}`,
            body: `${a.courseId?.name || 'Course'} · ${a.universityId?.name || 'University'}`,
            time: a.updatedAt || a.createdAt,
            link: '/student/applications',
          })
        );
      }

      /* sort newest first */
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs);

      notifCache.key = cacheKey;
      notifCache.notifications = notifs;
      notifCache.fetchedAt = Date.now();
    } catch (err) { console.error('Failed to build notifications', err); }
    finally { setNotifLoading(false); }
  }, [role, adminPrefix, user?._id]);

  useEffect(() => {
    if (user?._id) {
      setReadIds(getReadIds(user._id));
      setClearedIds(getClearedIds(user._id));
      buildNotifications();
    }
  }, [role, user?._id, buildNotifications]);

  const visibleNotifications = notifications.filter((n) => !clearedIds.has(n.id));
  const unreadCount = visibleNotifications.filter((n) => !readIds.has(n.id)).length;

  const handleNotifOpen = () => {
    setNotifOpen((p) => !p);
    setUserMenuOpen(false);
  };

  const markAllRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
    saveReadIds(user._id, all);
  };

  const markOneRead = (id) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(user._id, next);
  };

  const clearAllNotifications = () => {
    const all = new Set([...clearedIds, ...notifications.map((n) => n.id)]);
    setClearedIds(all);
    saveClearedIds(user._id, all);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  /* breadcrumb: find the nav item matching the current route */
  let activeCrumb = null;
  for (const group of navGroups) {
    const found = group.items.find((it) => isActive(it.to, it.exact));
    if (found) { activeCrumb = { section: group.section, label: found.label }; break; }
  }

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    /* auto-mark notifications for the current page as read */
    if (user?._id && notifications.length > 0) {
      const linked = notifications.filter((n) => n.link === location.pathname);
      if (linked.length > 0) {
        const next = new Set(readIds);
        linked.forEach((n) => next.add(n.id));
        setReadIds(next);
        saveReadIds(user._id, next);
      }
    }
    // Intentionally scoped to route changes only, including notifications/readIds
    // here would re-trigger this effect after the setReadIds call above, looping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 96 : 272 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          shrink-0 flex flex-col relative
          bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900
          shadow-[8px_0_32px_-16px_rgba(5,11,38,0.45)]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >

        {/* Collapse toggle — floats on the sidebar's edge, half in/half out */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-40 w-8 h-8 items-center justify-center rounded-full bg-accent-500 shadow-theme-md text-primary-900 hover:bg-accent-400 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Just Go Study" className="h-12 w-auto object-contain shrink-0 rounded-lg" />
              <span className="font-bold text-[16px] tracking-tight text-white leading-tight whitespace-nowrap">
                Just Go Study
                <span className="block text-[12px] font-semibold text-accent-300">Control Panel</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="lg:hidden flex items-center justify-center hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Just Go Study" className="h-10 w-auto object-contain" />
            </Link>
          )}
        </div>

        {/* Nav groups */}
        <nav ref={sidebarNavRef} className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6" aria-label="Main navigation">
          {navGroups.map((group, groupIdx) => (
            <div key={group.section} className={groupIdx > 0 ? 'pt-5 border-t border-white/10' : ''}>
              {!collapsed && (
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/40 px-3 mb-2 select-none">
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={handleBeforeNavigate}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors duration-150 select-none ${collapsed ? 'justify-center' : ''} ${active
                        ? 'text-primary-950 bg-accent-400 shadow-theme-md'
                        : 'text-white/60 hover:bg-accent-400/10 hover:text-accent-300'
                        }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          // Navy (not gold) — the indicator bar needs to
                          // contrast against the pill's own bg, which is
                          // gold now instead of white.
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary-700"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors ${active ? 'bg-primary-700 text-white' : 'bg-white/10 text-white/70 group-hover:bg-accent-400/20 group-hover:text-accent-300'
                        }`}>
                        <Icon icon={item.icon} className="w-4 h-4" />
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User mini-card */}
        <div className={`px-3 pt-3 shrink-0 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          <Link
            to={role === 'student' ? '/student/profile' : role === 'agent' ? '/agent/profile' : role === 'university' ? '/university/profile' : `${adminPrefix}/profile`}
            title={collapsed ? user?.name : undefined}
            className={`flex items-center gap-2.5 rounded-xl hover:bg-white/10 transition-colors ${collapsed ? 'p-1.5' : 'w-full p-2'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden ring-1 ring-white/15">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-[14px] font-semibold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[12px] text-accent-300 truncate mt-0.5">{ROLE_LABELS[role]}</p>
              </div>
            )}
          </Link>
        </div>

        {/* Actions / Links */}
        <div className="px-3 pb-4 shrink-0 pt-3 space-y-1.5">
          <Link
            to="/"
            title={collapsed ? 'Back to Site' : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-semibold text-white/80 hover:bg-accent-400/10 hover:text-accent-300 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="w-[30px] h-[30px] rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5 text-accent-300" />
            </span>
            {!collapsed && 'Back to Site'}
          </Link>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-semibold text-rose-300 hover:bg-rose-500/10 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="w-[30px] h-[30px] rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
            </span>
            {!collapsed && 'Log out'}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN AREA ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-ink-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-2 sm:gap-4">

          {/* Left */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-ink-600" />
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl hover:bg-cream-100 text-ink-600 hover:text-primary-600 transition-colors shrink-0 text-sm font-medium"
              title="Go Back to Main Site"
              aria-label="Go back to main site"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Home button - mobile only */}
            <Link
              to="/"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 transition-colors shrink-0"
              title="Go to Home"
            >
              <House className="w-4 h-4 text-ink-600" />
            </Link>

            {/* Breadcrumb */}
            {!hideBreadcrumb && (
              <div className="hidden lg:flex items-center gap-1.5 text-sm min-w-0 pl-2 pr-3 border-l border-ink-100">
                <span className="text-ink-600 font-medium truncate">{ROLE_LABELS[role]}</span>
                {activeCrumb && (
                  <>
                    {activeCrumb.section !== 'Menu' && (
                      <>
                        <ChevronRight className="w-3 h-3 text-ink-600 shrink-0" />
                        <span className="text-ink-600 font-medium truncate">{activeCrumb.section}</span>
                      </>
                    )}
                    <ChevronRight className="w-3 h-3 text-ink-600 shrink-0" />
                    <span className="text-ink-800 font-semibold truncate">{activeCrumb.label}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Clock, BST */}
            <div className="hidden md:flex items-center gap-2 bg-cream-50 border border-ink-200 rounded-xl px-3 py-1.5 select-none">
              <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <div className="text-left">
                <p className="text-[14px] font-bold text-ink-900 leading-none tabular-nums tracking-tight">{bstTime}</p>
                <p className="text-[11px] text-ink-600 font-semibold uppercase tracking-wide mt-0.5">Bangladesh Standard Time</p>
              </div>
            </div>

            {/* Notification bell + dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifOpen}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${notifOpen ? 'bg-primary-50 text-primary-600' : 'hover:bg-cream-100 text-ink-600'}`}
              >
                <Bell className={`w-4 h-4 ${notifOpen ? 'fill-primary-600' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-ink-100 z-50 overflow-hidden shadow-theme-lg">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-ink-100">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink-900 text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-extrabold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[12px] font-semibold text-primary-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      {visibleNotifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-100 transition-colors"
                          title="Clear all"
                          aria-label="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-ink-600" />
                        </button>
                      )}
                      <button
                        onClick={() => { buildNotifications(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-100 transition-colors"
                        title="Refresh"
                        aria-label="Refresh notifications"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 text-ink-600 ${notifLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="overflow-y-auto max-h-[400px]">
                    {notifLoading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg skeleton shrink-0"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 skeleton rounded w-2/3"></div>
                              <div className="h-2.5 skeleton rounded w-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : visibleNotifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <BellOff className="w-8 h-8 text-ink-200 mx-auto mb-3" />
                        <p className="text-sm text-ink-600">No notifications yet</p>
                      </div>
                    ) : (
                      <div>
                        {visibleNotifications.map((n) => {
                          const isRead = readIds.has(n.id);
                          return (
                            <button
                              key={n.id}
                              onClick={() => { markOneRead(n.id); setNotifOpen(false); navigate(n.link); }}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-cream-50 transition-colors border-b border-ink-50 last:border-0 ${!isRead ? 'bg-primary-50/30' : ''
                                }`}
                            >
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                                <Icon icon={n.icon} className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs leading-snug ${!isRead ? 'font-bold text-ink-900' : 'font-medium text-ink-700'}`}>
                                    {n.title}
                                  </p>
                                  {!isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1"></span>
                                  )}
                                </div>
                                <p className="text-[12px] text-ink-600 mt-0.5 leading-snug truncate">{n.body}</p>
                                <p className="text-[11px] text-ink-600 mt-1 tabular-nums">
                                  {n.time ? new Date(n.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' }) : ''}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {visibleNotifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-ink-100 bg-cream-50/60">
            <button
              onClick={() => { setNotifOpen(false); navigate(role === 'admin' || role === 'super_admin' || role === 'developer' ? `${adminPrefix}/applications` : role === 'agent' ? '/agent/applications' : role === 'university' ? '/university/applications' : '/student/applications'); }}
              className="text-xs font-semibold text-primary-600 hover:underline w-full text-center"
            >
              View all applications →
            </button>
          </div>
                  )}
                </div>
              )}
            </div>

            {/* Help */}
            <button
              onClick={() => navigate('/contact')}
              aria-label="Help"
              title="Help"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-ink-600" />
            </button>

            {/* User avatar + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl border border-ink-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[14px] font-semibold text-ink-800 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[12px] text-ink-600 capitalize mt-0.5">{ROLE_LABELS[role]}</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-ink-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-ink-100 py-2 z-50 overflow-hidden shadow-theme-lg">
                  <div className="px-4 py-4 border-b border-ink-50 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-900 break-words">{user?.name}</p>
                      <p className="text-xs text-primary-600 font-semibold mt-0.5">{user?.role === 'super_admin' ? 'Super Admin' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                      <p className="text-xs text-ink-600 break-all mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                  <Link to={role === 'student' ? '/student/profile' : role === 'agent' ? '/agent/profile' : role === 'university' ? '/university/profile' : '/admin/profile'}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-ink-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <CircleUser className="w-4 h-4 text-ink-600" />
                    My Profile
                  </Link>
                  <div className="border-t border-ink-50 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Own Suspense boundary, separate from the page-level one in
                  App.jsx: when just the routed page's lazy chunk is still
                  downloading, only this content area should go blank — the
                  sidebar/header (siblings, outside this boundary) must stay
                  mounted instead of the whole shell flashing away. No loader
                  here by design, dashboard pages just pop in once ready. */}
              <Suspense fallback={null}>
                {children || <Outlet />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
