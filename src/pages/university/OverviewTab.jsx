import { Clock, Users, Award, CheckCircle2 } from 'lucide-react';
import { SectionHeading, RichText } from '../../components/study/DetailsPageKit';

const UniversityOverviewTab = ({ university }) => (
  <div className="space-y-12">
    <div className="bg-white p-10 md:p-12 rounded-3xl border border-ink-100 shadow-sm">
      <SectionHeading updatedAt={university.updatedAt}>About {university.name}</SectionHeading>
      <div className="prose prose-slate max-w-none">
        <RichText
          content={university.description || `${university.name} is located in ${university.location}, ${university.country}, with a research focus and students from around the world.`}
        />
      </div>
    </div>

    {(university.history || university.campusLife) && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {university.history && (
          <div className="bg-white p-10 rounded-3xl border border-ink-100 shadow-sm">
            <h3 className="text-xl font-bold text-ink-900 mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-600" />
              Our History
            </h3>
            <RichText content={university.history} />
          </div>
        )}
        {university.campusLife && (
          <div className="bg-white p-10 rounded-3xl border border-ink-100 shadow-sm">
            <h3 className="text-xl font-bold text-ink-900 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5 text-primary-600" />
              Campus Life
            </h3>
            <RichText content={university.campusLife} />
          </div>
        )}
      </div>
    )}

    {university.facilities && university.facilities.length > 0 && (
      <div className="bg-white p-10 md:p-12 rounded-3xl border border-ink-100 shadow-sm">
        <SectionHeading>Campus Facilities</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {university.facilities.map((facility, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-cream-50 rounded-2xl border border-ink-100 group hover:bg-primary-600 transition-all">
              <CheckCircle2 className="w-4 h-4 text-primary-600 group-hover:text-white" />
              <span className="text-xs font-bold text-ink-700 group-hover:text-white">{facility}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl text-white">
      <Award className="w-10 h-10 mb-6 text-primary-200" />
      <h3 className="text-xl font-bold mb-4">Academic Standing</h3>
      <p className="text-primary-100 text-sm leading-relaxed font-medium">
        {university.ranking
          ? `Recognized internationally with a QS World Ranking of #${university.ranking}.`
          : 'One of the universities in our study-abroad network.'}
      </p>
    </div>
  </div>
);

export default UniversityOverviewTab;
