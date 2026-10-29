// Client-side profile-completeness scoring — every item is a simple
// present/absent check against data the profile pages already load, so this
// never goes stale against a separately-stored percentage. Each role has its
// own weighted checklist; `percent` is just filled/total.

const isFilled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return value > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

const score = (checklist) => {
  const filled = checklist.filter((item) => item.done).length;
  const percent = checklist.length ? Math.round((filled / checklist.length) * 100) : 0;
  return { percent, missing: checklist.filter((item) => !item.done).map((item) => item.label) };
};

export const getStudentCompletion = (profile) => {
  if (!profile) return { percent: 0, missing: [] };
  const checklist = [
    { label: 'Phone number', done: isFilled(profile.phone) },
    { label: 'Gender', done: isFilled(profile.gender) },
    { label: 'Date of birth', done: isFilled(profile.dateOfBirth) },
    { label: 'Address', done: isFilled(profile.address?.city) && isFilled(profile.address?.country) },
    { label: 'IELTS score', done: isFilled(profile.ieltsScore) },
    { label: 'Desired country', done: isFilled(profile.desiredCountry) },
    { label: 'Academic qualifications', done: isFilled(profile.academicQualifications) },
    { label: 'Preferred courses', done: isFilled(profile.preferredCourses) },
    { label: 'Preferred degree levels', done: isFilled(profile.studyPreferences?.degreeLevels) },
    { label: 'Budget', done: isFilled(profile.studyPreferences?.budget) },
    { label: 'Intake season', done: isFilled(profile.studyPreferences?.intakeSeason) },
    { label: 'Resume / CV', done: isFilled(profile.resume) },
    { label: 'Passport number', done: isFilled(profile.passportNumber) },
    { label: 'NID / Birth certificate number', done: isFilled(profile.nidOrBirthCertNumber) },
    { label: 'SSC/HSC board', done: isFilled(profile.board) },
    { label: 'Guardian details', done: isFilled(profile.guardian?.name) && isFilled(profile.guardian?.phone) },
  ];
  return score(checklist);
};

export const getAgentCompletion = (profile) => {
  if (!profile) return { percent: 0, missing: [] };
  const checklist = [
    { label: 'Phone number', done: isFilled(profile.phone) },
    { label: 'Company name', done: isFilled(profile.companyName) },
    { label: 'Designation', done: isFilled(profile.designation) },
    { label: 'Office address', done: isFilled(profile.officeAddress?.city) && isFilled(profile.officeAddress?.country) },
    { label: 'Years of experience', done: isFilled(profile.experienceYears) },
    { label: 'Specialized countries', done: isFilled(profile.specializedCountries) },
    { label: 'Bio', done: isFilled(profile.bio) },
    { label: 'Languages spoken', done: isFilled(profile.languagesSpoken) },
    { label: 'Certifications', done: isFilled(profile.certifications) },
    { label: 'Company logo', done: isFilled(profile.companyLogo) },
    { label: 'Website', done: isFilled(profile.website) },
    { label: 'Trade license number', done: isFilled(profile.tradeLicenseNumber) },
    { label: 'TIN', done: isFilled(profile.tin) },
  ];
  return score(checklist);
};

export const getUniversityCompletion = (uni) => {
  if (!uni) return { percent: 0, missing: [] };
  const checklist = [
    { label: 'Description', done: isFilled(uni.description) },
    { label: 'Logo', done: isFilled(uni.logo) },
    { label: 'Website', done: isFilled(uni.website) },
    { label: 'Ranking', done: isFilled(uni.ranking) },
    { label: 'Established year', done: isFilled(uni.establishedYear) },
    { label: 'Campus type', done: isFilled(uni.campusType) },
    { label: 'Total students', done: isFilled(uni.totalStudents) },
    { label: 'History', done: isFilled(uni.history) },
    { label: 'Campus life', done: isFilled(uni.campusLife) },
    { label: 'Facilities', done: isFilled(uni.facilities) },
    { label: 'Admission requirements', done: isFilled(uni.admissionRequirements) },
    { label: 'Academics overview', done: isFilled(uni.academics?.overview) },
    { label: 'Admissions process overview', done: isFilled(uni.admissionsProcess?.overview) },
  ];
  return score(checklist);
};
