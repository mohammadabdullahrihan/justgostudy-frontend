import { X, GraduationCap, Briefcase } from 'lucide-react';

// Read-only viewer for a Student's or Agent's full submitted profile —
// admin/super_admin/developer only (gated by the "View" button that opens
// this in UserManagement.jsx, not by anything in here). Pulls from the same
// StudentProfile/AgentProfile documents the self-service profile pages
// write to, so it's always exactly what the user submitted.

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-ink-900 break-words">{value || <span className="text-ink-400 font-normal italic">Not provided</span>}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-widest text-primary-600">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const formatAddress = (addr) => {
  if (!addr) return '';
  return [addr.street, addr.city, addr.state, addr.country, addr.zip].filter(Boolean).join(', ');
};

const StudentDetail = ({ profile }) => (
  <>
    <Section title="Personal">
      <Field label="Phone" value={profile.phone} />
      <Field label="Gender" value={profile.gender} />
      <Field label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''} />
      <Field label="Address" value={formatAddress(profile.address)} />
    </Section>

    <Section title="Identification">
      <Field label="Passport Number" value={profile.passportNumber} />
      <Field label="NID / Birth Certificate Number" value={profile.nidOrBirthCertNumber} />
      <Field label="SSC/HSC Board" value={profile.board} />
    </Section>

    <Section title="Guardian / Sponsor">
      <Field label="Name" value={profile.guardian?.name} />
      <Field label="Relation" value={profile.guardian?.relation} />
      <Field label="Occupation" value={profile.guardian?.occupation} />
      <Field label="Phone" value={profile.guardian?.phone} />
    </Section>

    <Section title="Academics">
      <Field label="IELTS Score" value={profile.ieltsScore} />
      <Field label="Desired Countries" value={(profile.desiredCountry || []).join(', ')} />
      <Field label="Preferred Courses" value={(profile.preferredCourses || []).join(', ')} />
    </Section>

    {profile.academicQualifications?.length > 0 && (
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary-600">Qualifications</h3>
        <div className="space-y-2">
          {profile.academicQualifications.map((q, i) => (
            <div key={i} className="bg-cream-50 border border-ink-100 rounded-xl p-3 text-sm text-ink-700">
              <span className="font-bold">{q.level}</span> — {q.institution} ({q.passingYear}, CGPA {q.cgpa})
            </div>
          ))}
        </div>
      </div>
    )}

    <Section title="Study Preferences">
      <Field label="Degree Levels" value={(profile.studyPreferences?.degreeLevels || []).join(', ')} />
      <Field label="Budget" value={profile.studyPreferences?.budget ? `$${profile.studyPreferences.budget}` : ''} />
      <Field label="Intake Season" value={profile.studyPreferences?.intakeSeason} />
      <Field label="Scholarship Alerts" value={profile.studyPreferences?.scholarshipAlerts ? 'Enabled' : 'Disabled'} />
    </Section>

    {profile.resume && (
      <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-primary-600 hover:underline">
        View Resume / CV →
      </a>
    )}
  </>
);

const AgentDetail = ({ profile }) => (
  <>
    <Section title="Professional">
      <Field label="Company / Agency" value={profile.companyName} />
      <Field label="Designation" value={profile.designation} />
      <Field label="Phone" value={profile.phone} />
      <Field label="Years of Experience" value={profile.experienceYears} />
      <Field label="Specialized Countries" value={(profile.specializedCountries || []).join(', ')} />
      <Field label="Office Address" value={formatAddress(profile.officeAddress)} />
    </Section>

    <Section title="Profile & Credentials">
      <Field label="Website" value={profile.website} />
      <Field label="Languages Spoken" value={(profile.languagesSpoken || []).join(', ')} />
      <Field label="Certifications" value={(profile.certifications || []).join(', ')} />
    </Section>
    {profile.bio && (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-0.5">Bio</p>
        <p className="text-sm text-ink-700 leading-relaxed">{profile.bio}</p>
      </div>
    )}

    <Section title="Business Verification">
      <Field label="Trade License Number" value={profile.tradeLicenseNumber} />
      <Field label="TIN" value={profile.tin} />
    </Section>

    {profile.companyLogo && (
      <img src={profile.companyLogo} alt="Company logo" className="h-14 object-contain" />
    )}
  </>
);

const UserProfileDetailModal = ({ type, profile, onClose }) => {
  if (!profile) return null;
  const roleUser = profile.user || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-theme-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shrink-0">
              {type === 'agent' ? <Briefcase className="w-5 h-5 text-primary-600" /> : <GraduationCap className="w-5 h-5 text-primary-600" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink-900 truncate">{roleUser.name || 'Profile'}</p>
              <p className="text-xs text-ink-500 truncate">{roleUser.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {type === 'agent' ? <AgentDetail profile={profile} /> : <StudentDetail profile={profile} />}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;
