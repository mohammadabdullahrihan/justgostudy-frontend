import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, MapPin, Users, ExternalLink, Video, AlertTriangle, RotateCcw } from 'lucide-react';
import * as eventService from '../services/eventService';
import Seo from '../components/common/Seo';

const TYPE_LABELS = {
  webinar: 'Webinar',
  seminar: 'Seminar',
  workshop: 'Workshop',
  fair: 'Education Fair',
};

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadEvents = useCallback(() => {
    let ignore = false;
    setLoading(true);
    setLoadError(null);
    eventService.getEvents({ activeOnly: 'true', upcomingOnly: 'true' })
      .then((data) => { if (!ignore) setEvents(Array.isArray(data) ? data : []); })
      .catch((err) => {
        if (ignore) return;
        console.error('Failed to load events', err);
        setLoadError(err?.message || 'Could not load events. Please try again.');
      })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => loadEvents(), [loadEvents]);

  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <Seo
        title="Upcoming Events & Webinars - Just Go Study"
        description="Join free study-abroad webinars, education fairs, and workshops — meet counsellors and university reps, ask questions live, and get scholarship and visa tips."
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-6 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <h1 className="mb-6 font-outfit text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Events &amp; Webinars
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-primary-100">
            Free live sessions with our counsellors — ask questions, get scholarship tips, and plan your next step.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-[2rem] bg-white border border-cream-100" />)}
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-16 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h2 className="mb-2 font-outfit text-xl font-bold text-ink-900">Something went wrong</h2>
            <p className="mb-6 text-ink-600">{loadError}</p>
            <button
              onClick={loadEvents}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[2rem] border border-cream-100 bg-white p-16 text-center shadow-theme-sm">
            <CalendarDays className="mx-auto mb-4 h-10 w-10 text-ink-200" />
            <h2 className="mb-2 font-outfit text-xl font-bold text-ink-900">No upcoming events right now</h2>
            <p className="text-ink-500">Check back soon, or follow our socials for the next announcement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const spotsLeft = event.capacity ? Math.max(event.capacity - event.registeredCount, 0) : null;
              return (
                <div
                  key={event._id}
                  className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-cream-100 bg-white shadow-theme-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-theme-lg"
                >
                  {event.coverImage ? (
                    <img src={event.coverImage} alt="" className="h-40 w-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
                      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-400/20 blur-2xl" />
                      <CalendarDays className="relative h-10 w-10 text-white/80" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-600">
                        {TYPE_LABELS[event.type] || event.type}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-secondary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-600">
                        {event.mode === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {event.mode === 'online' ? 'Online' : 'In-person'}
                      </span>
                    </div>
                    <h3 className="mb-2 font-outfit text-xl font-bold text-ink-900">{event.title}</h3>
                    {event.description && <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-600">{event.description}</p>}

                    <div className="mb-4 space-y-1.5 text-sm text-ink-500">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-ink-500" />
                        {formatDateTime(event.startDateTime)}
                      </p>
                      {event.mode === 'physical' && event.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-ink-500" />
                          {event.location}
                        </p>
                      )}
                      {event.capacity != null && (
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-ink-500" />
                          {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
                        </p>
                      )}
                    </div>

                    {event.registrationLink ? (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700"
                      >
                        Register Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <a
                        href="/contact"
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 px-6 py-3 text-sm font-bold text-primary-600 transition-all hover:bg-primary-50"
                      >
                        Ask Us About This Event
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
