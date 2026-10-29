import { useState, useEffect } from 'react';
import SubTabs from '../../components/study/SubTabs';
import EducationSystemTab from './EducationSystemTab';
import LanguageLearningTab from './LanguageLearningTab';
import SecondarySchoolsTab from './SecondarySchoolsTab';
import VocationalEducationTab from './VocationalEducationTab';

// Second nav level for the consolidated "Education Guide" main tab — these four
// were previously separate top-level tabs, folded together here since they're
// all genuinely "how education works in this country" content, to keep the
// main tab bar from growing unbounded as more country content gets added.
const CATEGORIES = [
  { id: 'system', label: 'Education System', Component: EducationSystemTab },
  { id: 'language', label: 'Language Learning', Component: LanguageLearningTab },
  { id: 'secondary', label: 'Secondary Schools', Component: SecondarySchoolsTab },
  { id: 'vocational', label: 'Vocational Education', Component: VocationalEducationTab },
];

const EducationGuideTab = ({ guide, country }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  useEffect(() => {
    setActiveCategory(CATEGORIES[0].id);
  }, [country]);

  const active = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const ActiveComponent = active.Component;

  return (
    <div>
      <SubTabs items={CATEGORIES} activeId={active.id} onChange={setActiveCategory} layoutId="education-guide-category-pill" />
      <ActiveComponent guide={guide} country={country} />
    </div>
  );
};

export default EducationGuideTab;
