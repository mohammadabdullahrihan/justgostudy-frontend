import Seo from '../components/common/Seo';
import { companyData } from '../constants/companyData';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-cream-50 pt-32 pb-20">
    <Seo
      title="Privacy Policy - Just Go Study"
      description="How Just Go Study collects, uses, stores, shares, and protects the personal data of students, parents, and website visitors."
    />
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="font-outfit text-4xl font-extrabold text-ink-900 mb-2">Privacy Policy</h1>
      <p className="text-ink-500 text-sm">Effective Date: October 24, 2024</p>
      <p className="text-ink-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink-700">
        <section>
          <p>
            Welcome to {companyData.name}. We respect your privacy and are committed to protecting the personal data
            of students, parents, and website visitors. This Privacy Policy explains how we collect, use, store,
            share, and protect your personal information when you visit our website{' '}
            <a href="https://www.justgostudy.academy" className="text-primary-600 font-semibold hover:underline">www.justgostudy.academy</a>{' '}
            or use our educational consultancy services.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">1. Legal Compliance</h2>
          <p>This Policy is drafted in accordance with the laws of the People&apos;s Republic of Bangladesh, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Personal Data Protection Act</li>
            <li>The Cyber Security Act (CSA), 2023 (specifically concerning protection of identity information)</li>
            <li>The Information and Communication Technology (ICT) Act, 2006 (and amendments)</li>
            <li>Article 43(b) of the Constitution of Bangladesh regarding privacy rights</li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">2. Information We Collect</h2>
          <p>
            To assist you with university admissions, visa applications, and student counseling, we may collect the
            following personal information:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Identity &amp; Contact Data:</strong> Full name, date of birth, passport details, National ID
              (NID) number, email address, phone number, and physical address.
            </li>
            <li>
              <strong>Academic &amp; Career Data:</strong> Transcripts, certificates, English language test scores
              (IELTS/TOEFL/PTE), CV/Resume, Statement of Purpose (SOP), and academic references.
            </li>
            <li>
              <strong>Financial &amp; Sponsorship Data:</strong> Bank statements, proof of funds, tax documents, and
              sponsor details (required exclusively for foreign university applications and visa processing).
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device information, and website usage data
              collected automatically via cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">3. How We Use Your Information</h2>
          <p>We collect and process your personal data strictly for lawful and legitimate educational consultancy purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To assess your eligibility for study abroad programs.</li>
            <li>To apply to foreign universities, colleges, and educational institutes on your behalf.</li>
            <li>To guide and prepare student visa application documentation for embassies/consulates.</li>
            <li>To communicate updates regarding applications, scholarship opportunities, and appointments.</li>
            <li>To fulfill statutory obligations under the laws of Bangladesh.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">4. Consent &amp; Lawful Basis</h2>
          <p>
            By submitting your documents or filling out forms on our website or at our office, you grant explicit
            consent for {companyData.name}.
          </p>
          <p>
            <strong>Minors:</strong> If a student is under 18 years of age, consent must be provided by a parent or
            legal guardian.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">5. Sharing &amp; International Data Transfers</h2>
          <p>
            Given the nature of foreign education consulting, your personal data may be shared with or transferred
            to third parties outside Bangladesh:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Partner Universities &amp; Institutions:</strong> International admissions offices reviewing
              your application.
            </li>
            <li>
              <strong>Government Bodies &amp; Embassies:</strong> Foreign High Commissions, Embassies, VFS Global,
              and immigration departments for student visa clearance.
            </li>
            <li>
              <strong>Authorized Service Providers:</strong> English test booking bodies, student accommodation
              providers, or travel insurance partners (only with your prior instruction/consent).
            </li>
          </ul>
          <p>We do not sell, rent, or trade your personal data to any third party for commercial marketing purposes.</p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">6. Data Security</h2>
          <p>
            We implement appropriate technical, administrative, and physical security measures to protect your
            personal data from unauthorized access, disclosure, alteration, or destruction:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Physical student files are locked in secure storage rooms.</li>
            <li>Digital data is encrypted and stored on password-protected servers.</li>
            <li>Access to student records is restricted strictly to authorized staff on a need-to-know basis.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">7. Data Retention</h2>
          <p>
            We retain your personal data only as long as necessary to fulfill the purposes outlined in this Policy,
            or as required by applicable tax, accounting, or legal obligations under Bangladeshi law. Once the
            retention period expires, physical files are securely shredded, and digital files are permanently
            deleted.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">8. Your Legal Rights</h2>
          <p>Under applicable data privacy principles, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete information.</li>
            <li>
              <strong>Withdrawal of Consent:</strong> Withdraw your consent for data processing at any time (Note:
              Withdrawing consent may limit our ability to continue processing your university or visa applications).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">9. Third-Party Links &amp; Cookies</h2>
          <p>
            Our website may use cookies to enhance your browsing experience. Additionally, our site may contain
            links to external university websites or embassy portals. We are not responsible for the privacy
            practices of third-party websites.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">10. Updates to This Policy</h2>
          <p>
            We reserve the right to modify or update this Privacy Policy at any time to reflect legal or regulatory
            changes in Bangladesh. Updates will be posted on this page with an updated &quot;Last Updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">11. Contact &amp; Complaints</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please
            contact our Data Compliance Manager at:
          </p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Company Name:</strong> Just Go Study</li>
            <li>
              <strong>Office Address:</strong> Kha-76/A, Samata Sky View, Flat# 6B, Shahjadpur, Gulshan-2,
              Dhaka-1212, Bangladesh.
            </li>
            <li>
              <strong>Phone Number:</strong>{' '}
              <a href="tel:+8801901366830" className="text-primary-600 font-semibold hover:underline">+880 1901366830</a>
            </li>
            <li>
              <strong>Email Address:</strong>{' '}
              <a href="mailto:justgostudy25@gmail.com" className="text-primary-600 font-semibold hover:underline">justgostudy25@gmail.com</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
