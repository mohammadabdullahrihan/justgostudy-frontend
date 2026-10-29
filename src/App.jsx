import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SmoothScroll from './components/common/SmoothScroll';
import StickyWhatsApp from './components/common/StickyWhatsApp';
import PrivacyBanner from './components/common/PrivacyBanner';
import SiteBanner from './components/common/SiteBanner';
import SitePopup from './components/common/SitePopup';
import { usePageVariants } from './router/transitions';
import ErrorBoundary from './components/common/ErrorBoundary';
import NewsletterSuccessModal from './components/common/NewsletterSuccessModal';
import BrandLoader from './components/common/BrandLoader';
import { Toaster } from 'react-hot-toast';

// Shown while a route's lazy chunk downloads. min-h-[60vh] (set inside
// BrandLoader) holds the page height steady so the footer doesn't jump up
// and back down as the chunk lands.
const RouteFallback = () => <BrandLoader message="Loading" />;

// All routes are code-split via React.lazy. Admin pages go first, they are
// the largest chunk group and only ever loaded for admin/super_admin sessions.
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminLanguageClubPage = lazy(() => import('./pages/admin/AdminLanguageClubPage'));
const AdminUniversitiesPage = lazy(() => import('./pages/admin/AdminUniversitiesPage'));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplicationsPage'));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage'));
const AdminResources = lazy(() => import('./pages/admin/AdminResources'));
const AdminSuccess = lazy(() => import('./pages/admin/AdminSuccess'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminFlashcards = lazy(() => import('./pages/admin/AdminFlashcards'));
const AdminExamPrep = lazy(() => import('./pages/admin/AdminExamPrep'));
const AdminCalculatorDefaults = lazy(() => import('./pages/admin/AdminCalculatorDefaults'));
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'));
const AdminStudyPrograms = lazy(() => import('./pages/admin/AdminStudyPrograms'));
const AdminConsultations = lazy(() => import('./pages/admin/AdminConsultations'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminTabs = lazy(() => import('./pages/admin/AdminTabs'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminGuide = lazy(() => import('./pages/admin/AdminGuide'));
const SuperAdminGuide = lazy(() => import('./pages/admin/SuperAdminGuide'));
const DeveloperGuide = lazy(() => import('./pages/admin/DeveloperGuide'));
const FeatureRequests = lazy(() => import('./pages/admin/FeatureRequests'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminPopups = lazy(() => import('./pages/admin/AdminPopups'));
const AdminFaqs = lazy(() => import('./pages/admin/AdminFaqs'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminSeoMeta = lazy(() => import('./pages/admin/AdminSeoMeta'));
const AdminLeadMagnets = lazy(() => import('./pages/admin/AdminLeadMagnets'));
const AdminMarketingAnalytics = lazy(() => import('./pages/admin/AdminMarketingAnalytics'));
const AdminQuizLeads = lazy(() => import('./pages/admin/AdminQuizLeads'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));

// Public marketing pages
const Home = lazy(() => import('./pages/home'));
const Courses = lazy(() => import('./pages/Courses'));
const Universities = lazy(() => import('./pages/Universities'));
const Contact = lazy(() => import('./pages/Contact'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const OurServices = lazy(() => import('./pages/OurServices'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const JoinUs = lazy(() => import('./pages/join'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const StudentResources = lazy(() => import('./pages/StudentResources'));
const OurSuccess = lazy(() => import('./pages/success'));

// Auth
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

// Shared dashboard landing (student/agent/university/educator/admin)
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Persistent dashboard shell (sidebar/header), hoisted to a parent layout
// route per role-group so it stays mounted across in-dashboard navigation
// instead of remounting on every route change.
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));

// Language Club
const LanguageClubHome = lazy(() => import('./pages/LanguageClubHome'));
const LanguageExplorePage = lazy(() => import('./pages/LanguageExplorePage'));
const LanguageLearnPage = lazy(() => import('./pages/LanguageLearnPage'));
const LanguageDetailPage = lazy(() => import('./pages/LanguageDetailPage'));
const LanguageLeaderboard = lazy(() => import('./pages/LanguageLeaderboard'));
const LanguageClubProfile = lazy(() => import('./pages/LanguageClubProfile'));
const LanguageFlashcards = lazy(() => import('./pages/LanguageFlashcards'));
const ExamPrepHub = lazy(() => import('./pages/exam-prep/ExamPrepHub'));
const IELTSPage = lazy(() => import('./pages/exam-prep/IELTSPage'));
const PTEPage = lazy(() => import('./pages/exam-prep/PTEPage'));
const TOEFLPage = lazy(() => import('./pages/exam-prep/TOEFLPage'));
const GREGMATPage = lazy(() => import('./pages/exam-prep/GREGMATPage'));

// Student
const ApplicationForm = lazy(() => import('./pages/student/ApplicationForm'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentGuide = lazy(() => import('./pages/student/StudentGuide'));
const Favorites = lazy(() => import('./pages/student/Favorites'));
const StudentApplicationsPage = lazy(() => import('./pages/student/StudentApplicationsPage'));

// University
const UniversityDashboard = lazy(() => import('./pages/university/UniversityDashboard'));
const UniversityCoursesPage = lazy(() => import('./pages/university/UniversityCoursesPage'));
const UniversityApplicationsPage = lazy(() => import('./pages/university/UniversityApplicationsPage'));
const UniversityProfile = lazy(() => import('./pages/university/UniversityProfile'));
const UniversityGuide = lazy(() => import('./pages/university/UniversityGuide'));

// Agent
const AgentProfile = lazy(() => import('./pages/agent/AgentProfile'));
const AgentGuide = lazy(() => import('./pages/agent/AgentGuide'));
const AgentApplicationsPage = lazy(() => import('./pages/agent/AgentApplicationsPage'));
const AgentStudentsPage = lazy(() => import('./pages/agent/AgentStudentsPage'));

// Study Abroad
const StudyAbroadLayout = lazy(() => import('./layouts/StudyAbroadLayout'));
const StudyAbroadHome = lazy(() => import('./pages/study-abroad'));
const CountryDetailPage = lazy(() => import('./pages/CountryDetailPage'));
const CostCalculatorPage = lazy(() => import('./pages/CostCalculatorPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ApplyNowPage = lazy(() => import('./pages/ApplyNowPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ScholarshipsPage = lazy(() => import('./pages/study-abroad/ScholarshipsPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const DestinationsPage = lazy(() => import('./pages/DestinationsPage'));
const ProfileStudyPreferences = lazy(() => import('./pages/ProfileStudyPreferences'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const UniversityDetails = lazy(() => import('./pages/UniversityDetails'));

const VisaTimelineTracker = lazy(() => import('./pages/tools/VisaTimelineTracker'));
const ROIEstimator = lazy(() => import('./pages/tools/ROIEstimator'));
const ComparisonTool = lazy(() => import('./pages/tools/ComparisonTool'));
const CourseComparisonTool = lazy(() => import('./pages/tools/CourseComparisonTool'));
const IELTSBandCalculator = lazy(() => import('./pages/tools/IELTSBandCalculator'));
const CountryMatchQuiz = lazy(() => import('./pages/tools/CountryMatchQuiz'));

const NotFound = lazy(() => import('./pages/NotFound'));

const DASHBOARD_PREFIXES = ['/student/', '/agent/', '/university/', '/admin/', '/super-admin/', '/developer/'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

// List of all valid public routes that should show the standard Navbar/Footer
const VALID_PUBLIC_ROUTES = [
  '/', '/courses', '/universities', '/join-us', '/contact', '/about-us', '/book-appointment', '/student-resources', '/our-success', '/events'
];

const App = () => {
  const location = useLocation();

  const isDashboard = DASHBOARD_PREFIXES.some((p) => location.pathname.startsWith(p));
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const isStudyAbroad = location.pathname.startsWith('/study-abroad');
  const isLanguageClub = location.pathname.startsWith('/language-club');
  const isProfileRoute = location.pathname.startsWith('/profile/');

  // Check if current path is a valid public route
  const isValidPublicRoute = VALID_PUBLIC_ROUTES.includes(location.pathname);

  // Routes that render their own header/footer (dashboards, auth pages,
  // Study Abroad's own layout, Language Club's own nav+footer inside its
  // pages). Anything else, including the 404 catch-all, which previously
  // had no explicit entry and rendered with no Navbar/Footer at all, falls
  // back to the standard shell.
  const hasOwnLayout = isDashboard || isAuthPage || isStudyAbroad || isLanguageClub || isProfileRoute;
  const isShell = isValidPublicRoute || !hasOwnLayout;

  // Lenis smooth scroll on every public-facing page (standard shell + custom
  // shells like /study-abroad and /language-club). Dashboards and auth pages
  // scroll inside their own containers, so they keep native scrolling.
  const smoothScrollEnabled = !isDashboard && !isAuthPage;

  const pageVariants = usePageVariants(isDashboard);

  return (
    <MotionConfig reducedMotion="user">
    <div className={isShell ? 'min-h-screen bg-cream-50 flex flex-col text-ink-900' : ''}>
      <SmoothScroll enabled={smoothScrollEnabled} />
      {smoothScrollEnabled && <StickyWhatsApp />}
      {smoothScrollEnabled && <PrivacyBanner />}
      {isShell && <SiteBanner />}
      {isShell && <SitePopup />}
      <NewsletterSuccessModal />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          className: 'font-outfit',
          style: {
            background: '#ffffff',
            color: '#1f1f1f',
            padding: '14px 18px',
            borderRadius: '16px',
            boxShadow: '0px 16px 32px -8px rgba(14, 16, 23, 0.14)',
            border: '1px solid #ececee',
            fontSize: '14px',
            fontWeight: 600,
          },
          success: {
            iconTheme: { primary: '#109677', secondary: '#ffffff' },
            style: { border: '1px solid #d1faec' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            style: { border: '1px solid #fecaca' },
          },
        }}
      />
      {isShell && <Navbar />}

      <main className={isShell ? 'flex-grow' : ''}>
        <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            // Dashboard routes share one key so this outer tree (and the
            // DashboardLayout mounted inside it) doesn't remount on every
            // in-dashboard navigation — only the entrance from a non-dashboard
            // page replays the wrapper transition. Page-to-page transitions
            // inside the dashboard are handled by DashboardLayout's own
            // inner AnimatePresence around just the routed content.
            key={isDashboard ? 'dashboard' : location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={() => ScrollTrigger.refresh()}
          >
          <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Canonical pages now live under /study-abroad (StudyAbroadLayout),
                redirect the old URLs to avoid duplicate-content. */}
            <Route path="/courses" element={<Navigate to="/study-abroad/courses" replace />} />
            <Route path="/universities" element={<Navigate to="/study-abroad/universities" replace />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/our-services" element={<OurServices />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/student-resources" element={<StudentResources />} />
            <Route path="/our-success" element={<OurSuccess />} />

            {/* Study Abroad */}
            <Route element={<StudyAbroadLayout />}>
              <Route path="/study-abroad" element={<StudyAbroadHome />} />
              <Route path="/study-abroad/courses" element={<Courses />} />
              <Route path="/study-abroad/course/:id" element={<CourseDetails />} />
              <Route path="/study-abroad/universities" element={<Universities />} />
              <Route path="/study-abroad/university/:id" element={<UniversityDetails />} />
              <Route path="/study-abroad/destinations" element={<DestinationsPage />} />
              <Route path="/study-abroad/destination/:country" element={<CountryDetailPage />} />
              <Route path="/study-abroad/cost-calculator" element={<CostCalculatorPage />} />
              <Route path="/study-abroad/tools" element={<ToolsPage />} />
              <Route path="/study-abroad/tools/visa-tracker" element={<VisaTimelineTracker />} />
              <Route path="/study-abroad/tools/roi-estimator" element={<ROIEstimator />} />
              <Route path="/study-abroad/tools/comparison" element={<ComparisonTool />} />
              <Route path="/study-abroad/tools/course-comparison" element={<CourseComparisonTool />} />
              <Route path="/study-abroad/tools/ielts-band-calculator" element={<IELTSBandCalculator />} />
              <Route path="/study-abroad/tools/country-match-quiz" element={<CountryMatchQuiz />} />
              <Route path="/study-abroad/apply/:universityId/:courseId" element={<ApplyNowPage />} />
              <Route path="/study-abroad/blog" element={<BlogPage />} />
              <Route path="/study-abroad/scholarships" element={<ScholarshipsPage />} />
              <Route path="/study-abroad/blog/:slug" element={<BlogDetailPage />} />
            </Route>

            {/* Dashboards: each role-group shares one PrivateRoute+DashboardLayout
                parent (layout route with no path of its own), so the sidebar/
                header stay mounted across in-dashboard navigation instead of
                remounting on every route change — see DashboardLayout's own
                inner Suspense/AnimatePresence around just the routed page. */}

            {/* Student */}
            <Route element={<PrivateRoute allowedRoles={['student']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/profile/study-preferences" element={<ProfileStudyPreferences />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/apply" element={<ApplicationForm />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/favorites" element={<Favorites />} />
              <Route path="/student/applications" element={<StudentApplicationsPage />} />
              <Route path="/student/guide" element={<StudentGuide />} />
            </Route>

            {/* Agent */}
            <Route element={<PrivateRoute allowedRoles={['agent']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/agent/dashboard" element={<Dashboard />} />
              <Route path="/agent/profile" element={<AgentProfile />} />
              <Route path="/agent/applications" element={<AgentApplicationsPage />} />
              <Route path="/agent/students" element={<AgentStudentsPage />} />
              <Route path="/agent/guide" element={<AgentGuide />} />
            </Route>

            {/* University */}
            <Route element={<PrivateRoute allowedRoles={['university']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/university/dashboard" element={<UniversityDashboard />} />
              <Route path="/university/courses" element={<UniversityCoursesPage />} />
              <Route path="/university/applications" element={<UniversityApplicationsPage />} />
              <Route path="/university/profile" element={<UniversityProfile />} />
              <Route path="/university/guide" element={<UniversityGuide />} />
            </Route>

            {/* Educator */}
            <Route element={<PrivateRoute allowedRoles={['educator']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/educator/dashboard" element={<Dashboard />} />
            </Route>

            {/* Pages shared by both 'admin' and 'super_admin' */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'super_admin']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/tabs" element={<AdminTabs />} />
              <Route path="/admin/language-club" element={<AdminLanguageClubPage />} />
              <Route path="/super-admin/language-club" element={<AdminLanguageClubPage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/manage-resources" element={<Navigate to="/admin/resources" replace />} />
            <Route path="/admin/manage-success" element={<Navigate to="/admin/success" replace />} />
            <Route element={<PrivateRoute allowedRoles={['admin']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/universities" element={<AdminUniversitiesPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/success" element={<AdminSuccess />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/flashcards" element={<AdminFlashcards />} />
              <Route path="/admin/exam-prep" element={<AdminExamPrep />} />
              <Route path="/admin/calculator-defaults" element={<AdminCalculatorDefaults />} />
              <Route path="/admin/destinations" element={<AdminDestinations />} />
              <Route path="/admin/study-abroad" element={<AdminStudyPrograms />} />
              <Route path="/admin/consultations" element={<AdminConsultations />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/popups" element={<AdminPopups />} />
              <Route path="/admin/faqs" element={<AdminFaqs />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/referrals" element={<AdminReferrals />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/seo-meta" element={<AdminSeoMeta />} />
              <Route path="/admin/lead-magnets" element={<AdminLeadMagnets />} />
              <Route path="/admin/marketing-analytics" element={<AdminMarketingAnalytics />} />
              <Route path="/admin/quiz-leads" element={<AdminQuizLeads />} />
              <Route path="/admin/guide" element={<AdminGuide />} />
              <Route path="/admin/feature-requests" element={<FeatureRequests />} />
            </Route>

            {/* Super Admin (also covers /developer/*, a 1:1 mirrored URL
                prefix for the same role — developer is a full alias of
                super_admin, see middleware/roleCheck.js + PrivateRoute.jsx) */}
            <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="/super-admin/manage-resources" element={<Navigate to="/super-admin/resources" replace />} />
            <Route path="/super-admin/manage-success" element={<Navigate to="/super-admin/success" replace />} />
            <Route path="/developer" element={<Navigate to="/developer/dashboard" replace />} />
            <Route path="/developer/manage-resources" element={<Navigate to="/developer/resources" replace />} />
            <Route path="/developer/manage-success" element={<Navigate to="/developer/success" replace />} />
            <Route element={<PrivateRoute allowedRoles={['super_admin']}><DashboardLayout /></PrivateRoute>}>
              <Route path="/super-admin/dashboard" element={<Dashboard />} />
              <Route path="/super-admin/activities" element={<AdminActivities />} />
              <Route path="/super-admin/users" element={<AdminUsersPage />} />
              <Route path="/super-admin/universities" element={<AdminUniversitiesPage />} />
              <Route path="/super-admin/courses" element={<AdminCoursesPage />} />
              <Route path="/super-admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/super-admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/super-admin/resources" element={<AdminResources />} />
              <Route path="/super-admin/success" element={<AdminSuccess />} />
              <Route path="/super-admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/super-admin/flashcards" element={<AdminFlashcards />} />
              <Route path="/super-admin/exam-prep" element={<AdminExamPrep />} />
              <Route path="/super-admin/calculator-defaults" element={<AdminCalculatorDefaults />} />
              <Route path="/super-admin/destinations" element={<AdminDestinations />} />
              <Route path="/super-admin/study-abroad" element={<AdminStudyPrograms />} />
              <Route path="/super-admin/consultations" element={<AdminConsultations />} />
              <Route path="/super-admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/super-admin/tabs" element={<AdminTabs />} />
              <Route path="/super-admin/banners" element={<AdminBanners />} />
              <Route path="/super-admin/popups" element={<AdminPopups />} />
              <Route path="/super-admin/faqs" element={<AdminFaqs />} />
              <Route path="/super-admin/coupons" element={<AdminCoupons />} />
              <Route path="/super-admin/referrals" element={<AdminReferrals />} />
              <Route path="/super-admin/events" element={<AdminEvents />} />
              <Route path="/super-admin/seo-meta" element={<AdminSeoMeta />} />
              <Route path="/super-admin/lead-magnets" element={<AdminLeadMagnets />} />
              <Route path="/super-admin/marketing-analytics" element={<AdminMarketingAnalytics />} />
              <Route path="/super-admin/quiz-leads" element={<AdminQuizLeads />} />
              <Route path="/super-admin/guide" element={<SuperAdminGuide />} />
              <Route path="/super-admin/feature-requests" element={<FeatureRequests />} />

              {/* Developer Dashboard — same pages as Super Admin, mirrored
                  under their own URL prefix so the address bar always says
                  /developer/... instead of /super-admin/... */}
              <Route path="/developer/dashboard" element={<Dashboard />} />
              <Route path="/developer/activities" element={<AdminActivities />} />
              <Route path="/developer/users" element={<AdminUsersPage />} />
              <Route path="/developer/universities" element={<AdminUniversitiesPage />} />
              <Route path="/developer/courses" element={<AdminCoursesPage />} />
              <Route path="/developer/applications" element={<AdminApplicationsPage />} />
              <Route path="/developer/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/developer/resources" element={<AdminResources />} />
              <Route path="/developer/success" element={<AdminSuccess />} />
              <Route path="/developer/testimonials" element={<AdminTestimonials />} />
              <Route path="/developer/flashcards" element={<AdminFlashcards />} />
              <Route path="/developer/exam-prep" element={<AdminExamPrep />} />
              <Route path="/developer/calculator-defaults" element={<AdminCalculatorDefaults />} />
              <Route path="/developer/destinations" element={<AdminDestinations />} />
              <Route path="/developer/study-abroad" element={<AdminStudyPrograms />} />
              <Route path="/developer/consultations" element={<AdminConsultations />} />
              <Route path="/developer/newsletter" element={<AdminNewsletter />} />
              <Route path="/developer/tabs" element={<AdminTabs />} />
              <Route path="/developer/language-club" element={<AdminLanguageClubPage />} />
              <Route path="/developer/banners" element={<AdminBanners />} />
              <Route path="/developer/popups" element={<AdminPopups />} />
              <Route path="/developer/faqs" element={<AdminFaqs />} />
              <Route path="/developer/coupons" element={<AdminCoupons />} />
              <Route path="/developer/referrals" element={<AdminReferrals />} />
              <Route path="/developer/events" element={<AdminEvents />} />
              <Route path="/developer/seo-meta" element={<AdminSeoMeta />} />
              <Route path="/developer/lead-magnets" element={<AdminLeadMagnets />} />
              <Route path="/developer/marketing-analytics" element={<AdminMarketingAnalytics />} />
              <Route path="/developer/quiz-leads" element={<AdminQuizLeads />} />
              {/* Same shared board as above, dedicated URL for 'developer' (aliased to super_admin in PrivateRoute) so its sidebar can link to "Requests" instead of "Request a Feature". */}
              <Route path="/developer/requests" element={<FeatureRequests />} />
              <Route path="/developer/guide" element={<DeveloperGuide />} />
            </Route>

            {/* Language Club */}
            <Route path="/language-club" element={<LanguageClubHome />} />
            <Route path="/language-club/explore" element={<LanguageExplorePage />} />
            <Route path="/language-club/language/:languageId" element={<LanguageDetailPage />} />
            <Route path="/language-club/learn/:languageId" element={<LanguageLearnPage />} />
            <Route path="/language-club/leaderboard" element={<LanguageLeaderboard />} />
            <Route path="/language-club/profile" element={<LanguageClubProfile />} />
            <Route path="/language-club/flashcards" element={<LanguageFlashcards />} />
            <Route path="/language-club/flashcards/:languageId" element={<LanguageFlashcards />} />
            <Route path="/language-club/exam-prep" element={<ExamPrepHub />} />
            <Route path="/language-club/exam-prep/ielts" element={<IELTSPage />} />
            <Route path="/language-club/exam-prep/pte" element={<PTEPage />} />
            <Route path="/language-club/exam-prep/toefl" element={<TOEFLPage />} />
            <Route path="/language-club/exam-prep/gre-gmat" element={<GREGMATPage />} />

            {/* Auth */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </motion.div>
        </AnimatePresence>
        </ErrorBoundary>
      </main>

      {isShell && <Footer />}
    </div>
    </MotionConfig>
  );
};

export default App;
