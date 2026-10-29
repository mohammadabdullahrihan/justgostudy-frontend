import { useRef, useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Globe, CheckCircle2, DollarSign, Award, Briefcase,
  Calendar, MapPin, GraduationCap, ArrowLeft, ArrowRight, Loader2, Info,
  Video, Play, Star, Heart, Navigation, Calculator, ThermometerSun, Languages, Clock, Wallet, Plane, Phone, Users, Quote, ChevronRight, Home, BookOpen, Filter, X, Share2, BookmarkPlus, TrendingUp, Eye, MessageSquare, Download, Search, ChevronDown, UserCheck, FileText, Shield, ShieldCheck, Zap, Target, Award as AwardIcon, Lightbulb, Globe2, Compass, Map, Plus, Check, Printer, School, Wrench, ArrowUp, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as studyService from '../services/studyService';
import * as tabService from '../services/tabService';
import Seo from '../components/common/Seo';
import EmailGateModal from '../components/common/EmailGateModal';
import { buildBreadcrumbSchema } from '../utils/seoSchemas';
import { openConsultationModal } from '../hooks/useConsultationModal';
import { useModalA11y } from '../hooks/useModalA11y';
import ScrollReveal from '../components/study/ScrollReveal';
import sanitizeHtml from '../utils/sanitizeHtml';
import CountryHeroSection from './country/HeroSection';
import AtAGlanceSection from './country/AtAGlanceSection';
import OverviewSection from './country/OverviewSection';
import UniversitiesTab from './country/UniversitiesTab';
import CostTab from './country/CostTab';
import VisaTab from './country/VisaTab';
import AboutCountryTab from './country/AboutCountryTab';
import EducationGuideTab from './country/EducationGuideTab';
import LivingTab from './country/LivingTab';
import { PANEL_TONES } from '../utils/tabTones';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Icon mapping from string to Lucide icon
const iconMap = {
  Globe, GraduationCap, Heart, DollarSign, Award, Briefcase, UserCheck, Plane,
  CheckCircle2, Calendar, MapPin, ArrowLeft, ArrowRight, Loader2, Info, Video,
  Play, Star, Navigation, Calculator, ThermometerSun, Languages, Clock, Wallet,
  Phone, Users, Quote, ChevronRight, Home, BookOpen, Filter, X, Share2,
  BookmarkPlus, TrendingUp, Eye, MessageSquare, Download, Search, ChevronDown,
  FileText, Shield, ShieldCheck, Zap, Target, AwardIcon, Lightbulb, Globe2,
  Compass, Map, Plus, School, Wrench,
};

/* ============================== Tab panels ============================== */
/* Content and data bindings are unchanged from the original page, only
   reorganized into components so each tab can mount/animate independently.
   Overview / Universities / Cost / Visa panels and the shared card grids now
   live in ./country/*; the remaining panels stay here. */

const LifestyleTabPanel = ({ guide, country }) => (
  <div className="space-y-12">
    {(guide?.lifestyle?.weather || guide?.lifestyle?.publicTransport) && (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          Life in {country}
        </h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guide?.lifestyle?.weather && (
          <div className="bg-primary-50/60 p-8 rounded-[2rem] border border-primary-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
              <ThermometerSun className="w-6 h-6 text-primary-600" />
            </div>
            <h4 className="font-bold text-ink-900 mb-3">Weather & Climate</h4>
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.lifestyle.weather) }}
            />
          </div>
        )}
        {guide?.lifestyle?.publicTransport && (
          <div className="bg-secondary-50/60 p-8 rounded-[2rem] border border-secondary-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6">
              <Plane className="w-6 h-6 text-secondary-600" />
            </div>
            <h4 className="font-bold text-ink-900 mb-3">Public Transport</h4>
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.lifestyle.publicTransport) }}
            />
          </div>
        )}
      </div>
    </section>
    )}

    {/* Post-Arrival Essentials */}
    {guide?.lifestyle?.postArrival && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent-400 fill-current" />
            Post-Arrival Essentials
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guide.lifestyle.postArrival.map((item, idx) => {
            const IconComponent = { Wallet, Phone, Home, ShieldCheck, UserCheck }[item.icon] || Home;
            const chips = [
              { border: 'border-b-primary-500', bg: 'bg-primary-50', text: 'text-primary-600' },
              { border: 'border-b-secondary-500', bg: 'bg-secondary-50', text: 'text-secondary-600' },
              { border: 'border-b-accent-500', bg: 'bg-accent-50', text: 'text-accent-600' },
            ];
            const chip = chips[idx % chips.length];
            return (
              <div key={idx} className={`p-6 bg-white rounded-3xl border border-cream-100 shadow-sm hover:shadow-xl transition-all border-b-4 ${chip.border}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${chip.bg}`}>
                  <IconComponent className={`w-5 h-5 ${chip.text}`} />
                </div>
                <h4 className="font-bold text-ink-900 mb-2">{item.title}</h4>
                <p
                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                />
              </div>
            );
          })}
        </div>
      </section>
    )}
  </div>
);

const ScholarshipsTabPanel = ({ guide }) => (
  <>
    {guide?.scholarshipsData?.length > 0 && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-accent-400 fill-current" />
            Available Scholarships
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guide.scholarshipsData.map((scholarship, idx) => {
            const IconComponent = { AwardIcon, Heart, Lightbulb, Globe2, GraduationCap, Star }[scholarship.icon] || AwardIcon;
            const tone = PANEL_TONES[idx % PANEL_TONES.length];
            return (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl ${tone.hoverBorder} hover:-translate-y-1 transition-all group h-full`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center transition-colors`}>
                      <IconComponent className={`w-6 h-6 ${tone.iconText}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-ink-900 mb-2">{scholarship.title}</h4>
                      <p className="text-accent-600 font-bold text-sm mb-2">{scholarship.amount}</p>
                      <p
                        className="guide-content-links text-black font-medium text-[17px] mb-3"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(scholarship.description) }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-500">Deadline: {scholarship.deadline}</span>
                        <button
                          onClick={openConsultationModal}
                          className="text-primary-600 text-sm font-medium hover:text-primary-700"
                        >
                          Apply →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    )}

    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-5">Scholarship Tips</h2>
      </ScrollReveal>
      <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { tip: 'Start applications early', icon: Calendar },
            { tip: 'Maintain strong GPA', icon: Star },
            { tip: 'Get strong recommendation letters', icon: MessageSquare },
            { tip: 'Write compelling essays', icon: FileText },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-primary-900 font-medium">{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

const CareersTabPanel = ({ guide }) => (
  <>
    {guide?.careerData && (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-primary-400 fill-current" />
          Career Opportunities
        </h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {guide?.careerData
          ? [
              {
                title: 'Avg Starting Salary',
                value: guide.careerData.avgStartingSalary,
                description: 'Typical salary for graduates',
                icon: Award,
              },
              {
                title: 'Growth Rate',
                value: guide.careerData.growthRate,
                description: 'Career growth potential',
                icon: TrendingUp,
              },
              {
                title: 'Top Companies',
                value: (guide.careerData.topCompanies || []).slice(0, 3).join(', '),
                description: 'Leading employers',
                icon: Target,
              },
              {
                title: 'Standard Work Week',
                value: guide.careerData.standardWorkWeek,
                description: 'Legal/standard working hours',
                icon: Clock,
              },
            ].filter((stat) => stat.value && stat.value.trim()).map((stat, idx) => {
              const IconComponent = { Award, TrendingUp, Target, Briefcase, Shield, Clock }[stat.icon] || Award;
              const tone = PANEL_TONES[idx % PANEL_TONES.length];
              return (
                <ScrollReveal key={idx} delay={idx * 100}>
                  <div className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl ${tone.hoverBorder} hover:scale-105 transition-all text-center`}>
                    <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`w-6 h-6 ${tone.iconText}`} />
                    </div>
                    <h4 className="font-bold text-ink-900 mb-2">{stat.title}</h4>
                    <p
                      className={`guide-content-links text-2xl font-bold mb-2 ${tone.iconText}`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(stat.value) }}
                    />
                    <p
                      className="guide-content-links text-black font-medium text-[17px]"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(stat.description) }}
                    />
                  </div>
                </ScrollReveal>
              );
            })
          : null}
      </div>
    </section>
    )}

    {guide?.careerData?.popularJobRoles?.length > 0 && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5">In-Demand Careers</h2>
        </ScrollReveal>
        <div className="space-y-4">
          {guide.careerData.popularJobRoles.map((role, idx) => {
            const tone = PANEL_TONES[idx % PANEL_TONES.length];
            return (
            <ScrollReveal key={idx} delay={idx * 50}>
              <div className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-lg ${tone.hoverBorder} hover:translate-x-1 transition-all flex items-center gap-4 group`}>
                <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center transition-colors`}>
                  <Briefcase className={`w-6 h-6 ${tone.iconText}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-ink-900 mb-1">{role}</h4>
                </div>
                <ChevronRight className={`w-5 h-5 text-ink-500 transition-colors`} />
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </section>
    )}

    {(guide?.officialLinks || []).filter((l) => l.category === 'Job Platform').length > 0 && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center gap-3">
            <Search className="w-6 h-6 text-primary-400" />
            Find Jobs
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guide.officialLinks
            .filter((l) => l.category === 'Job Platform')
            .map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary-50 p-5 rounded-2xl border border-secondary-100 shadow-sm hover:shadow-lg hover:border-secondary-300 transition-all flex items-center justify-between gap-3"
              >
                <span className="font-semibold text-ink-900 flex items-center gap-2">
                  {link.name}
                  <ExternalLink className="w-4 h-4 text-ink-500" />
                </span>
                <ArrowRight className="w-4 h-4 text-ink-500" />
              </a>
            ))}
        </div>
      </section>
    )}
  </>
);

const BangladeshisTabPanel = ({ guide }) => (
  <div className="space-y-12">
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Users className="w-6 h-6 text-secondary-500" />
          Information for Bangladeshi Students
        </h2>
      </ScrollReveal>

      {guide?.bangladeshiDetails ? (
        <div className="grid grid-cols-1 gap-8">
          {/* Visa & Entry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary-50 p-8 rounded-[2rem] border border-secondary-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">Visa Success Rate</h4>
                  <p className="text-secondary-600 font-bold">{guide.bangladeshiDetails.visaSuccessRate}</p>
                </div>
              </div>
              <p className="text-black font-medium text-[17px] leading-relaxed">
                High visa success rate for qualified Bangladeshi students with complete documentation.
              </p>
            </div>

            <div className="bg-primary-50 p-8 rounded-[2rem] border border-primary-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">Entry Requirements</h4>
                  <p className="text-primary-600 font-bold">BD Standards</p>
                </div>
              </div>
              <p
                className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.bangladeshiDetails.entryRequirements) }}
              />
            </div>
          </div>

          {/* Popular Courses & Scholarships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-accent-50/60 p-8 rounded-[2.5rem] border border-accent-100 shadow-sm">
              <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-accent-500" />
                Popular Courses
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.bangladeshiDetails.popularCourses.map((course, idx) => (
                  <span key={idx} className="bg-accent-50 text-accent-700 px-4 py-2 rounded-full text-xs font-bold border border-accent-100">
                    {course}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-primary-50/60 p-8 rounded-[2.5rem] border border-primary-100 shadow-sm">
              <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-3">
                <AwardIcon className="w-5 h-5 text-primary-500" />
                Scholarships for BD
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.bangladeshiDetails.scholarshipsForBD.map((scholarship, idx) => (
                  <span key={idx} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-xs font-bold border border-primary-100">
                    {scholarship}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Work & Community */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-cream-50 p-8 rounded-[2rem] border border-cream-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-ink-600" />
                </div>
                <h4 className="font-bold text-ink-900">Part-time Work</h4>
              </div>
              <p
                className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.bangladeshiDetails.partTimeWork) }}
              />
            </div>

            <div className="bg-cream-50 p-8 rounded-[2rem] border border-cream-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <h4 className="font-bold text-ink-900">Community Support</h4>
              </div>
              <p
                className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.bangladeshiDetails.communitySupport) }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-cream-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-cream-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Info className="w-10 h-10 text-ink-500" />
          </div>
          <h3 className="text-xl font-bold text-ink-900 mb-2">Details Coming Soon</h3>
          <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
            We are currently gathering specific information for Bangladeshi students for this destination. Please check back later or contact our consultants.
          </p>
          <button
            onClick={openConsultationModal}
            className="mt-8 bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
          >
            Ask a Consultant
          </button>
        </div>
      )}
    </section>
  </div>
);

const TAB_PANELS = {
  overview: OverviewSection,
  lifestyle: LifestyleTabPanel,
  universities: UniversitiesTab,
  cost: CostTab,
  visa: VisaTab,
  scholarships: ScholarshipsTabPanel,
  careers: CareersTabPanel,
  bangladeshis: BangladeshisTabPanel,
  about: AboutCountryTab,
  education: EducationGuideTab,
  living: LivingTab,
};

/* ============================== Main page ============================== */

const CountryDetailPage = () => {
  const { country } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [guide, setGuide] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const guideSectionsRef = useRef(null);

  const scrollToGuideSections = () => {
    const el = guideSectionsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Could not copy link. Please copy it from the address bar.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this study guide for ${country} on Just Go Study: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };
  const [expandedSection, setExpandedSection] = useState(null);

  const heroRef = useRef(null);
  const heroImgWrapRef = useRef(null);

  useEffect(() => {
    const fetchCountryDetails = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [guideRes, searchRes, tabsRes] = await Promise.all([
          studyService.getDestinationByCountry(country),
          // Default search-endpoint limit (20) was truncating both the
          // "Universities"/"Programs" stat card and the Universities tab for
          // any country with more than 20 universities or courses in our DB.
          studyService.searchStudy({ country: country, limit: 200 }),
          tabService.getTabs()
        ]);
        setGuide(guideRes);
        setUniversities(searchRes.universities);
        setCourses(searchRes.courses);
        setTabs(tabsRes);
        const requestedTab = searchParams.get('tab');
        if (requestedTab && tabsRes.some((t) => t.id === requestedTab)) {
          setActiveTab(requestedTab);
        } else if (tabsRes.length > 0) {
          setActiveTab(tabsRes[0].id);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
        // 404 means this country simply has no guide yet; anything else (network
        // drop, 5xx) is a real failure and shouldn't be shown as "not found".
        setLoadError(error?.response?.status === 404 ? 'not-found' : 'network');
      } finally {
        setLoading(false);
      }
    };
    fetchCountryDetails();
    // Only re-fetch when the country changes — searchParams.get('tab') is
    // read once per load to pick the initial tab, not watched afterward, so
    // it's deliberately left out of the deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  /* Hero image parallax, oversized image translated within an overflow-hidden
     frame so scroll never reveals empty edges. */
  useGSAP(
    () => {
      if (!heroImgWrapRef.current) return;
      gsap.fromTo(
        heroImgWrapRef.current,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    },
    { scope: heroRef, dependencies: [guide] }
  );

  const shareModalRef = useModalA11y(showShareModal, () => setShowShareModal(false));
  const compareModalRef = useModalA11y(showCompareModal, () => setShowCompareModal(false));

  /* Mobile pill nav scrolls horizontally; keep the active tab in view instead
     of requiring the student to hunt for it after it scrolls off-screen. */
  const activeTabButtonRef = useRef(null);
  useEffect(() => {
    activeTabButtonRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  if (loading) return (
    <div className="bg-cream-50 min-h-screen pt-6 pb-24 animate-pulse">
      {/* Hero, matches HeroSection's rounded-b image block + floating stat bar */}
      <div className="h-[520px] md:h-[640px] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 rounded-b-[2.5rem] md:rounded-b-[3.5rem]" />
      <div className="relative z-10 px-4 -mt-20 md:-mt-24">
        <div className="container mx-auto">
          <div className="h-28 md:h-32 bg-white rounded-[1.75rem] md:rounded-[2rem] border border-cream-100 shadow-lg max-w-3xl mx-auto" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* At-a-Glance, three matched cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 bg-white rounded-3xl border border-cream-100 shadow-sm" />
          ))}
        </div>

        {/* Sidebar nav + content, matches the real [240px_1fr] grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-10">
          <div className="bg-white rounded-3xl border border-cream-100 shadow-sm p-2.5 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 w-28 lg:w-full shrink-0 bg-cream-200 rounded-xl" />
            ))}
          </div>
          <div className="space-y-6 min-w-0">
            <div className="h-8 w-2/3 bg-cream-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-cream-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loadError === 'network') return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-6 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Info className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-ink-900 mb-2">Something Went Wrong</h2>
        <p className="text-black font-medium text-[17px] mb-6">
          We couldn&apos;t load this page right now. Please check your connection and try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all"
          >
            Try Again
          </button>
          <Link to="/study-abroad" className="text-primary-600 font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-6">
      <div className="text-center">
        <Info className="w-16 h-16 text-ink-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-ink-900">Guide Not Found</h2>
        <p className="text-black font-medium text-[17px] mb-6">We couldn&apos;t find a guide for {country}.</p>
        <Link to="/study-abroad" className="text-primary-600 font-bold flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>
    </div>
  );

  const ActivePanel = TAB_PANELS[activeTab];

  return (
    <div className="bg-cream-50 min-h-screen pt-2 pb-24">
      <Seo
        title={`Study in ${country} - Just Go Study`}
        description={`Everything you need to study in ${country}: top universities, tuition and living costs, visa requirements, scholarships and career opportunities for Bangladeshi students.`}
        schema={buildBreadcrumbSchema([
          { name: 'Home', path: '/study-abroad' },
          { name: 'Destinations', path: '/study-abroad/destinations' },
          { name: country, path: `/study-abroad/destination/${encodeURIComponent(country)}` },
        ])}
      />
      {/* Hero Section, full-bleed image + overlay */}
      <CountryHeroSection
        heroRef={heroRef}
        heroImgWrapRef={heroImgWrapRef}
        country={country}
        guide={guide}
        universities={universities}
        courses={courses}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
        setShowShareModal={setShowShareModal}
        setShowCompareModal={setShowCompareModal}
        setShowGuideModal={setShowGuideModal}
      />
      <EmailGateModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        downloadUrl={guide?.guidePdfUrl}
        title={`${country} Country Guide`}
      />

      <div className="container mx-auto px-4 pb-8">
        {/* At a Glance: quick facts + intakes + career pitch as one matched
            row, right under the hero so the key decision-making info and
            CTAs are visible without scrolling into the tab content below. */}
        <AtAGlanceSection guide={guide} onViewCareers={() => setActiveTab('careers')} />

        {/* Content Grid: nav sidebar (page structure) | content.
            Left nav replaces the old horizontal pill tab bar, which stopped
            scaling once the country page grew past ~8 tabs (wrapped to several
            rows on mobile before any content was visible). A vertical list
            scrolls instead of wrapping, so it stays usable as more tabs get
            added. */}
        <div ref={guideSectionsRef} className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-10">
          {/* Left: page navigation. Outer <nav> is the grid item and stretches
              to the full row height on lg+ (matching the content column's
              height), so the inner sticky card holds its position for the
              entire scroll through the tab content and only releases right
              as the content ends — instead of releasing early against its
              own (short) natural height. */}
          <nav className="lg:self-stretch">
            <div className="sticky top-20 z-40 lg:top-24 bg-gradient-to-b from-primary-600 to-primary-700 rounded-3xl shadow-xl shadow-primary-900/20 p-2.5">
              <div className="hidden lg:flex items-center gap-2 px-3.5 pt-3 pb-2.5">
                <span className="h-px w-4 bg-accent-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-accent-400">
                  Guide Sections
                </p>
              </div>
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible -mx-1 px-1 lg:mx-0 lg:px-0">
                {tabs.map((tab) => {
                  const Icon = iconMap[tab.icon] || Globe;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      ref={isActive ? activeTabButtonRef : undefined}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base text-left whitespace-nowrap lg:whitespace-normal flex-shrink-0 transition-all ${
                        isActive
                          ? 'bg-accent-500 text-primary-950 shadow-md shadow-accent-900/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-950' : 'text-white/50'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Center: Detailed Guide, dashboard-style tab switch via AnimatePresence */}
          <div className="space-y-16 overflow-hidden min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-16"
              >
                {ActivePanel && (
                  <ActivePanel
                    guide={guide}
                    country={country}
                    universities={universities}
                    expandedSection={expandedSection}
                    setExpandedSection={setExpandedSection}
                    onNavigateTab={setActiveTab}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Back to Guide Sections, sits above the footer instead of floating as a corner icon */}
        <div className="flex justify-center pt-12">
          <button
            type="button"
            onClick={scrollToGuideSections}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-accent-500 hover:text-primary-950 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-primary-200 transition-all"
          >
            <ArrowUp className="w-4 h-4" />
            Back to Guide Sections
          </button>
        </div>
      </div>
      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/90 backdrop-blur-xl border border-cream-200/50 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Start Today</p>
              <p className="text-sm font-semibold text-ink-900">Study in {country}</p>
            </div>
          </div>
          <button
            onClick={openConsultationModal}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-200"
          >
            Apply Now
          </button>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              ref={shareModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 id="share-modal-title" className="text-xl font-bold text-ink-900">Share {country} Guide</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  <X className="w-5 h-5 text-ink-500" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    {linkCopied ? <Check className="w-5 h-5 text-primary-600" /> : <Share2 className="w-5 h-5 text-primary-600" />}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-ink-900">{linkCopied ? 'Copied!' : 'Copy Link'}</p>
                    <p className="text-sm text-ink-500">Share via any platform</p>
                  </div>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-ink-900">WhatsApp</p>
                    <p className="text-sm text-ink-500">Share with contacts</p>
                  </div>
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-accent-300 hover:bg-accent-50 transition-all"
                >
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-ink-900">Print / Save as PDF</p>
                    <p className="text-sm text-ink-500">Use your browser&apos;s print dialog</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCompareModal(false)}
          >
            <motion.div
              ref={compareModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-labelledby="compare-modal-title"
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 id="compare-modal-title" className="text-xl font-bold text-ink-900">Compare Countries</h3>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  <X className="w-5 h-5 text-ink-500" />
                </button>
              </div>
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-primary-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-primary-600" />
                </div>
                <p className="text-black font-medium text-[17px] mb-6 max-w-sm mx-auto">
                  Get a full side-by-side comparison of tuition, living costs, and visa requirements for {country} against other countries in our free Cost Calculator.
                </p>
                <Link
                  to="/study-abroad/cost-calculator"
                  onClick={() => setShowCompareModal(false)}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Open Cost Calculator <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountryDetailPage;
