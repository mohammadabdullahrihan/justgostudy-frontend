import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Info, AlertTriangle, Languages } from 'lucide-react';
import { buildChapters } from './guideChapters';

const LANG_STORAGE_KEY = 'dashboard_guide_lang';

// Groups a flat array of strings into paragraph / bullet-list blocks so
// consecutive "• " lines render as one <ul> instead of one <p> each.
const groupBody = (lines) => {
  const blocks = [];
  lines.forEach((line) => {
    const isBullet = line.startsWith('• ');
    const last = blocks[blocks.length - 1];
    if (isBullet && last?.type === 'ul') {
      last.items.push(line.slice(2));
    } else if (isBullet) {
      blocks.push({ type: 'ul', items: [line.slice(2)] });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  });
  return blocks;
};

const NoteBox = ({ note, lang }) => {
  const isWarning = note.type === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;
  return (
    <div
      className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${
        isWarning
          ? 'border-accent-200 bg-accent-50 text-accent-800'
          : 'border-primary-200 bg-primary-50 text-primary-700'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{lang === 'bn' ? note.bn : note.en}</p>
    </div>
  );
};

const Section = ({ section, lang }) => {
  const heading = lang === 'bn' ? section.headingBn : section.headingEn;
  const body = lang === 'bn' ? section.bodyBn : section.bodyEn;
  const blocks = groupBody(body);

  return (
    <div className="border-t border-cream-100 pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-outfit text-lg font-bold text-ink-900">{heading}</h3>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-600">
        {blocks.map((block, i) =>
          block.type === 'ul' ? (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>{block.text}</p>
          )
        )}
      </div>
      {section.note && <NoteBox note={section.note} lang={lang} />}
    </div>
  );
};

const DashboardGuidePage = ({ role }) => {
  const chapters = useMemo(() => buildChapters(role), [role]);
  const [activeId, setActiveId] = useState(chapters[0].id);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_STORAGE_KEY) || 'bn'; } catch { return 'bn'; }
  });

  useEffect(() => {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* storage unavailable, ignore */ }
  }, [lang]);

  const activeIndex = chapters.findIndex((c) => c.id === activeId);
  const activeChapter = chapters[activeIndex] || chapters[0];

  const goTo = (index) => {
    if (index < 0 || index >= chapters.length) return;
    setActiveId(chapters[index].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const TITLES = {
    admin: { en: 'Admin Guide', bn: 'অ্যাডমিন গাইড' },
    super_admin: { en: 'Super Admin Guide', bn: 'সুপার অ্যাডমিন গাইড' },
    developer: { en: 'Developer Guide', bn: 'ডেভেলপার গাইড' },
    student: { en: 'Student Guide', bn: 'স্টুডেন্ট গাইড' },
    agent: { en: 'Agent Guide', bn: 'এজেন্ট গাইড' },
    university: { en: 'University Guide', bn: 'ইউনিভার্সিটি গাইড' },
  };
  const titleEn = TITLES[role]?.en || 'Dashboard Guide';
  const titleBn = TITLES[role]?.bn || 'ড্যাশবোর্ড গাইড';
  const subtitleEn = 'Everything you need to use this dashboard, chapter by chapter.';
  const subtitleBn = 'এই ড্যাশবোর্ড ব্যবহারের জন্য যা যা দরকার, চ্যাপ্টার অনুযায়ী।';

  return (
    <>
    {/* Header */}
    <div className="mb-6 flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <BookOpen className="h-6 w-6 text-accent-300" />
        </div>
        <div>
          <h1 className="font-outfit text-2xl font-extrabold sm:text-3xl">
            {lang === 'bn' ? titleBn : titleEn}
          </h1>
          <p className="mt-1 text-sm text-primary-100">{lang === 'bn' ? subtitleBn : subtitleEn}</p>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex shrink-0 items-center gap-1 self-start rounded-full border border-white/20 bg-white/10 p-1 sm:self-auto">
        <Languages className="ml-2 h-4 w-4 text-primary-100" />
        {[
          { key: 'bn', label: 'বাংলা' },
          { key: 'en', label: 'English' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setLang(opt.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              lang === opt.key ? 'bg-white text-primary-700' : 'text-primary-100 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      {/* Chapter list — horizontal scroll on mobile, sticky column on desktop */}
      <div className="lg:sticky lg:top-0 lg:h-fit">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {chapters.map((chapter, i) => {
            const isActive = chapter.id === activeId;
            const label = lang === 'bn' ? chapter.titleBn : chapter.titleEn;
            return (
              <button
                key={chapter.id}
                onClick={() => goTo(i)}
                className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors lg:shrink lg:w-full ${
                  isActive
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-cream-100 bg-white text-ink-600 hover:border-primary-200 hover:bg-primary-50/40'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? 'bg-primary-600 text-white' : 'bg-cream-100 text-ink-500'
                  }`}
                >
                  <chapter.icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap lg:whitespace-normal">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter content */}
      <div className="min-w-0 rounded-[28px] border border-cream-100 bg-white p-6 shadow-theme-sm sm:p-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-600">
          {lang === 'bn' ? `অধ্যায় ${activeIndex + 1} / ${chapters.length}` : `Chapter ${activeIndex + 1} of ${chapters.length}`}
        </p>
        <h2 className="mb-6 font-outfit text-2xl font-bold text-ink-900 sm:text-3xl">
          {lang === 'bn' ? activeChapter.titleBn : activeChapter.titleEn}
        </h2>

        <div className="space-y-6">
          {activeChapter.sections.map((section, i) => (
            <Section key={i} section={section} lang={lang} />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="mt-8 flex items-center justify-between border-t border-cream-100 pt-6">
          <button
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="flex items-center gap-1.5 rounded-full border border-cream-200 px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cream-200 disabled:hover:text-ink-600"
          >
            <ChevronLeft className="h-4 w-4" /> {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === chapters.length - 1}
            className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lang === 'bn' ? 'পরবর্তী' : 'Next'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardGuidePage;
