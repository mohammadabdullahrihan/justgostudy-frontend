import { ShieldCheck, Globe, ClipboardList, Calendar, TrendingUp, FileText, UserCheck } from 'lucide-react';
import { SectionHeading, GroupProfilePanel } from '../../components/study/DetailsPageKit';

const UniversityAdmissionsTab = ({ university, ieltsRange, ieltsValues }) => {
  const process = university.admissionsProcess || {};

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 md:p-12 rounded-3xl border border-ink-100 shadow-sm">
        <SectionHeading updatedAt={university.updatedAt}>Admission Requirements</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-ink-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              General Documents
            </h4>
            <ul className="space-y-3">
              {(university.admissionRequirements && university.admissionRequirements.length > 0 ? university.admissionRequirements : [
                'Academic Transcripts',
                'Passport Copy',
                'Resume/CV',
                'Statement of Purpose',
                'Recommendation Letters',
              ]).map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-ink-600 font-bold">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-ink-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-secondary-600" />
              Language Proficiency
            </h4>
            <div className="bg-cream-50 p-6 rounded-2xl border border-ink-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-ink-600">IELTS Academic</span>
                <span className="text-sm font-bold text-primary-600">{ieltsRange}</span>
              </div>
              <p className="text-xs text-ink-500 font-medium mt-3">
                Based on {ieltsValues.length ? "this university's current programs" : 'available programs'}, exact score depends on your chosen course.
              </p>
            </div>
          </div>
        </div>
      </div>

      <GroupProfilePanel
        icon={ClipboardList}
        title="Admissions Process"
        overview={process.overview}
        updatedAt={university.updatedAt}
        emptyMessage="We're still gathering step-by-step admissions process details for this university — the general requirements above still apply. Ask a consultant for the latest deadlines."
        fields={[
          { key: 'deadlines', label: 'Application Deadlines', icon: Calendar, value: process.deadlines },
          { key: 'acceptanceRate', label: 'Acceptance Rate', icon: TrendingUp, value: process.acceptanceRate },
          { key: 'testPolicy', label: 'Standardized Test Policy', icon: FileText, value: process.testPolicy },
          { key: 'internationalRequirements', label: 'International Student Requirements', icon: UserCheck, value: process.internationalRequirements },
        ]}
      />
    </div>
  );
};

export default UniversityAdmissionsTab;
