// Field configs for the University self-service "Detailed Profile" tab —
// these mirror the University model's deep-profile sections 1:1 (the same
// {overview, ...subfields} shape the admin/seed research content uses), so
// a real university partner can now self-edit everything that previously
// only an admin/seed script could set.

export const OBJECT_SECTIONS = [
  {
    key: 'academics', title: 'Academics', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'notableDepartments', label: 'Notable Departments', multiline: true },
      { key: 'degreeLevels', label: 'Degree Levels Offered', multiline: true },
      { key: 'academicStrengths', label: 'Academic Strengths', multiline: true },
    ],
  },
  {
    key: 'admissionsProcess', title: 'Admissions Process', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'deadlines', label: 'Application Deadlines' },
      { key: 'acceptanceRate', label: 'Acceptance Rate' },
      { key: 'testPolicy', label: 'Standardized Test Policy', multiline: true },
      { key: 'internationalRequirements', label: 'International Student Requirements', multiline: true },
    ],
  },
  {
    key: 'tuitionAndAid', title: 'Tuition & Financial Aid', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'costBreakdown', label: 'Cost Breakdown', multiline: true },
      { key: 'paymentPlans', label: 'Payment Plans', multiline: true },
    ],
  },
  {
    key: 'campusAndFacilities', title: 'Campus & Facilities', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'libraries', label: 'Libraries', multiline: true },
      { key: 'labsAndTech', label: 'Labs & Technology', multiline: true },
      { key: 'sportsAndRecreation', label: 'Sports & Recreation', multiline: true },
      { key: 'dining', label: 'Dining', multiline: true },
    ],
  },
  {
    key: 'studentLife', title: 'Student Life', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'clubsAndOrganizations', label: 'Clubs & Organizations', multiline: true },
      { key: 'traditionsAndEvents', label: 'Traditions & Events', multiline: true },
      { key: 'diversity', label: 'Diversity', multiline: true },
    ],
  },
  {
    key: 'housing', title: 'Housing', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'onCampusOptions', label: 'On-Campus Options', multiline: true },
      { key: 'offCampusGuidance', label: 'Off-Campus Guidance', multiline: true },
      { key: 'costs', label: 'Housing Costs', multiline: true },
    ],
  },
  {
    key: 'rankingsAndReputation', title: 'Rankings & Reputation', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'subjectRankings', label: 'Subject Rankings', multiline: true },
      { key: 'accreditations', label: 'Accreditations', multiline: true },
    ],
  },
  {
    key: 'researchAndInnovation', title: 'Research & Innovation', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'researchCenters', label: 'Research Centers', multiline: true },
      { key: 'fundingAndOutput', label: 'Funding & Output', multiline: true },
    ],
  },
  {
    key: 'internationalStudentSupport', title: 'International Student Support', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'dedicatedOffice', label: 'Dedicated Office', multiline: true },
      { key: 'orientationAndVisaSupport', label: 'Orientation & Visa Support', multiline: true },
      { key: 'eslPrograms', label: 'ESL Programs', multiline: true },
    ],
  },
  {
    key: 'careerOutcomes', title: 'Career Outcomes', fields: [
      { key: 'overview', label: 'Overview', multiline: true },
      { key: 'careerServices', label: 'Career Services', multiline: true },
      { key: 'employmentRate', label: 'Employment Rate' },
      { key: 'avgStartingSalary', label: 'Avg Starting Salary' },
      { key: 'employerPartnerships', label: 'Employer Partnerships', multiline: true },
    ],
  },
];

export const ARRAY_SECTIONS = [
  {
    key: 'scholarshipsData', title: 'Scholarships', itemLabel: 'Scholarship',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'amount', label: 'Amount' },
      { key: 'deadline', label: 'Deadline' },
    ],
    empty: { title: '', description: '', amount: '', deadline: '' },
  },
  {
    key: 'notableAlumni', title: 'Notable Alumni', itemLabel: 'Alumnus',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'achievement', label: 'Achievement', multiline: true },
    ],
    empty: { name: '', achievement: '' },
  },
  {
    key: 'applicationTimeline', title: 'Application Timeline', itemLabel: 'Intake',
    fields: [
      { key: 'intake', label: 'Intake' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'notes', label: 'Notes', multiline: true },
    ],
    empty: { intake: '', deadline: '', notes: '' },
  },
  {
    key: 'officialLinks', title: 'Official Links', itemLabel: 'Link',
    fields: [
      { key: 'category', label: 'Category' },
      { key: 'name', label: 'Name' },
      { key: 'url', label: 'URL' },
    ],
    empty: { category: '', name: '', url: '' },
  },
];

// Builds the initial deep-form state from a loaded University doc, filling
// in empty-but-shaped defaults for any section the doc doesn't have yet.
export const buildDeepFormState = (uni) => {
  const state = {};
  OBJECT_SECTIONS.forEach((section) => {
    const existing = uni?.[section.key] || {};
    state[section.key] = {};
    section.fields.forEach((f) => { state[section.key][f.key] = existing[f.key] || ''; });
  });
  ARRAY_SECTIONS.forEach((section) => {
    state[section.key] = uni?.[section.key]?.length > 0
      ? uni[section.key].map((item) => ({ ...section.empty, ...item }))
      : [];
  });
  return state;
};
