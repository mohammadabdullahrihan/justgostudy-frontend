import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Loader2, Award as AwardIcon, Heart, Lightbulb, Globe2, GraduationCap, Star, ArrowRight,
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import Seo from '../../components/common/Seo';
import ScrollReveal from '../../components/study/ScrollReveal';
import { PANEL_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

const flagUrl = (countryCode) => (countryCode ? `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png` : null);
const guideUrl = (country) => `/study-abroad/destination/${encodeURIComponent(country)}?tab=scholarships`;

const ScholarshipsPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let ignore = false;
    studyService
      .getScholarships()
      .then((data) => {
        // India is intentionally excluded from Bangladeshi-student-facing
        // content site-wide.
        if (!ignore) setDestinations(Array.isArray(data) ? data.filter((d) => d.country !== 'India') : []);
      })
      .catch((error) => console.error('Error fetching scholarships:', error))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) => d.country.toLowerCase().includes(q));
  }, [destinations, searchQuery]);

  const totalScholarships = destinations.reduce((sum, d) => sum + (d.scholarshipsData?.length || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title="Scholarships for International Students - Just Go Study"
        description="Browse real, verified scholarships for Bangladeshi students studying abroad, by destination country."
      />

      <ScrollReveal>
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Scholarships
          </span>
          <h1 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Find a scholarship for your destination
          </h1>
          <p className="mt-4 text-ink-500">
            {totalScholarships > 0
              ? `${totalScholarships}+ verified scholarships across ${destinations.length} destination countries.`
              : 'Verified scholarship opportunities, organized by destination country.'}
          </p>
        </div>
      </ScrollReveal>

      <div className="mx-auto mt-8 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by country..."
            className="w-full rounded-full border border-ink-100 bg-white py-3 pl-11 pr-4 text-sm font-medium text-ink-900 shadow-sm focus:border-primary-400 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-ink-500">No destinations match &quot;{searchQuery}&quot;.</p>
      ) : (
        <div className="mt-14 space-y-16">
          {filtered.map((dest) => (
            <section key={dest._id}>
              <div className="mb-6 flex items-center gap-4">
                {flagUrl(dest.countryCode) && (
                  <img
                    src={flagUrl(dest.countryCode)}
                    alt={`${dest.country} flag`}
                    loading="lazy"
                    className="h-8 w-12 rounded-md object-cover shadow-sm"
                  />
                )}
                <h2 className="font-outfit text-2xl font-bold text-ink-900">{dest.country}</h2>
                <Link
                  to={guideUrl(dest.country)}
                  className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  View {dest.country} guide <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {dest.scholarshipsData.map((scholarship, idx) => {
                  const IconComponent = { AwardIcon, Heart, Lightbulb, Globe2, GraduationCap, Star }[scholarship.icon] || AwardIcon;
                  const tone = PANEL_TONES[idx % PANEL_TONES.length];
                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(guideUrl(dest.country))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(guideUrl(dest.country));
                      }}
                      className={`${tone.bg} group cursor-pointer p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl ${tone.hoverBorder} hover:-translate-y-1 transition-all h-full`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                          <IconComponent className={`w-6 h-6 ${tone.iconText}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-ink-900 mb-2">{scholarship.title}</h4>
                            <ArrowRight className={`w-4 h-4 shrink-0 mt-1 ${tone.iconText} transition-transform group-hover:translate-x-1`} />
                          </div>
                          {scholarship.amount && <p className="text-accent-600 font-bold text-sm mb-2">{scholarship.amount}</p>}
                          <p
                            className="guide-content-links text-black font-medium text-[15px] mb-3"
                            onClick={(e) => e.stopPropagation()}
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(scholarship.description) }}
                          />
                          {scholarship.deadline && (
                            <span className="text-xs text-ink-500">Deadline: {scholarship.deadline}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipsPage;
