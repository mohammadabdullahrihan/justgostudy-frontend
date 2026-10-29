import { Target, FileText, Banknote, ShieldCheck, Languages, Plane } from 'lucide-react';

const TINTS = [
  { grad: 'from-primary-400 to-primary-600', icon: 'text-white' },
  { grad: 'from-secondary-400 to-secondary-600', icon: 'text-white' },
  { grad: 'from-accent-400 to-accent-500', icon: 'text-ink-900' },
];

const SERVICES = [
  {
    title: 'Personalized University & Program Shortlisting',
    icon: Target,
    description:
      'Every shortlist starts by matching a student’s academic profile, IELTS/PTE scores and financial preferences against the best-fit global universities and courses — not the other way around. Instead of pushing students toward whichever institutions are easiest to place, the counseling team works backward from the student’s own goals and budget to build a list of programs genuinely worth applying to.',
  },
  {
    title: 'Application & Profile Building',
    icon: FileText,
    description:
      'Hands-on assistance with crafting compelling Statements of Purpose (SOPs), Letters of Recommendation (LORs), resumes and portfolio preparation turns a thin application into one that actually represents the student’s strengths. Each document goes through real editing and feedback rather than being filled from a template, since admissions committees can tell the difference.',
  },
  {
    title: 'Scholarship Search & Filing',
    icon: Banknote,
    description:
      'The team actively identifies merit-based and need-based institutional scholarships to reduce the overall tuition burden, rather than leaving students to discover funding opportunities on their own. Every eligible scholarship gets filed alongside the main application so funding decisions land on the same timeline as admission offers.',
  },
  {
    title: 'Visa Guidance & Counseling',
    icon: ShieldCheck,
    description:
      'Step-by-step assistance with financial documentation, embassy compliance and simulated visa interview coaching takes students through the part of the process that causes the most anxiety. By the time a student walks into the real interview, they’ve already rehearsed the questions an officer is likely to ask and know exactly which documents to have ready.',
  },
  {
    title: 'Test Prep & Language Support',
    icon: Languages,
    description:
      'Free resources and Language Club access give students a structured way to prepare for IELTS, PTE and TOEFL without having to pay for a separate test-prep course on top of everything else. Practice materials and peer sessions are built directly into the counseling relationship rather than outsourced.',
  },
  {
    title: 'Pre-Departure Briefing & Settlement',
    icon: Plane,
    description:
      'Orientation on flight booking, accommodation search, foreign exchange (Forex) and local lifestyle integration closes the gap between getting a visa and actually landing ready to live and study abroad. Students leave the briefing with a practical checklist, not just a congratulations on their offer letter.',
  },
];

const CoreServicesSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Core Student Services
          </span>
          <h2 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Everything you need, in one place
          </h2>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {SERVICES.map((item, idx) => {
            const tint = TINTS[idx % TINTS.length];
            return (
              <div key={item.title} className="relative flex flex-col gap-5 sm:flex-row sm:gap-8">
                {/* number + icon column */}
                <div className="flex shrink-0 items-center gap-4 sm:w-20 sm:flex-col sm:items-start sm:gap-3">
                  <span className="font-outfit text-4xl font-black leading-none text-ink-900/10 sm:text-5xl">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-theme-sm ${tint.grad}`}>
                    <item.icon className={`h-6 w-6 ${tint.icon}`} />
                  </div>
                </div>

                {/* text column */}
                <div className={`flex-1 border-l-2 border-cream-200 pl-5 sm:pl-8 ${idx === SERVICES.length - 1 ? '' : 'pb-10 sm:pb-12'}`}>
                  <h3 className="mb-2 font-outfit text-xl font-bold leading-snug text-ink-900 sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreServicesSection;
