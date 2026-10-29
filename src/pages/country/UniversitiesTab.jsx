import { GraduationCap } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import { GroupedUniversityGrid, UniversityGrid } from './cards';

const UniversitiesTab = ({ country, universities }) => {
  // Only destinations with a subRegion taxonomy (USA, UK, Canada, Australia,
  // New Zealand so far) get the grouped/filterable layout — everywhere else
  // falls straight back to the plain grid, unchanged.
  const hasSubRegions = universities.some((uni) => uni.subRegion);

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-xl font-bold text-ink-900 mb-5 flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-accent-500" />
          Universities in {country}
        </h2>
      </ScrollReveal>
      {hasSubRegions ? (
        <GroupedUniversityGrid universities={universities} />
      ) : (
        <UniversityGrid universities={universities} />
      )}
    </section>
  );
};

export default UniversitiesTab;
