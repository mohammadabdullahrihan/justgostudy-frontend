import Seo from '../components/common/Seo';
import { companyData } from '../constants/companyData';

const TermsOfService = () => (
  <div className="min-h-screen bg-cream-50 pt-32 pb-20">
    <Seo
      title="Terms and Conditions - Just Go Study"
      description="The terms and conditions governing access to and use of Just Go Study's website, services, consultations, and digital platforms."
    />
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="font-outfit text-4xl font-extrabold text-ink-900 mb-2">Terms and Conditions</h1>
      <p className="text-ink-500 text-sm">Effective Date: October 24, 2024</p>
      <p className="text-ink-500 text-sm mb-10">
        Website URL:{' '}
        <a href="https://www.justgostudy.academy" className="text-primary-600 font-semibold hover:underline">www.justgostudy.academy</a>
      </p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink-700">
        <section>
          <p>
            Welcome to {companyData.name}. These Terms and Conditions govern your access to and use of our website,
            services, consultations, and digital platforms.
          </p>
          <p>
            By accessing or using this website, you (&quot;User,&quot; &quot;Student,&quot; or &quot;Client&quot;)
            agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using our
            website or services.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">1. Legal Basis &amp; Jurisdiction</h2>
          <p>
            These Terms are formulated in accordance with the laws of the People&apos;s Republic of Bangladesh,
            including the Contract Act, 1872, the Information and Communication Technology (ICT) Act, 2006, and the
            Cyber Security Act, 2023. Any legal disputes arising out of these Terms or use of our services shall
            fall under the exclusive jurisdiction of the courts located in Dhaka, Bangladesh.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">2. Scope of Consultancy Services</h2>
          <p>
            {companyData.name} provides educational guidance, university application assistance, document
            verification guidance, test preparation advice, and student visa application support for foreign
            educational institutions.
          </p>
          <p>
            <strong>Non-Guarantee Clause:</strong> While we provide professional guidance to optimize your chances,
            {' '}{companyData.name} does not guarantee university admission, scholarship approval, or visa issuance.
            Final admission decisions rest solely with individual educational institutions, and visa decisions rest
            exclusively with foreign embassies, High Commissions, and immigration authorities.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">3. Student Responsibilities &amp; Document Accuracy</h2>
          <p>By utilizing our services or submitting information via our website, you agree and warrant that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Authenticity:</strong> All academic certificates, mark sheets, passport details, financial
              records, and personal documents provided by you are 100% genuine, authentic, and accurate.
            </li>
            <li>
              <strong>Prohibition of Fraud:</strong> Submitting forged, altered, or fraudulent documents is a severe
              offense under Sections 463 and 471 of the Penal Code, 1860, and applicable cybersecurity laws of
              Bangladesh.
            </li>
            <li>
              <strong>Consequences:</strong> If any submitted document is found to be forged or misleading, we
              reserve the right to immediately terminate our services, cancel your university applications, notify
              relevant authorities, and retain any service fees paid without refund.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">4. Fees, Payments &amp; Refund Policy</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Service Charges:</strong> Fees for specific services (such as application processing,
              translation, or counseling packages) will be clearly communicated to you prior to service initiation.
            </li>
            <li>
              <strong>Third-Party Fees:</strong> Tuition fees, university application fees, embassy visa fees,
              medical tests, and English language exam fees (IELTS/TOEFL/PTE) are paid directly to third-party
              institutions and are strictly non-refundable by us.
            </li>
            <li>
              <strong>Refund Policy:</strong> Service fees paid directly to {companyData.name} are strictly
              non-refundable once administrative work or application processing has commenced, regardless of
              whether a visa or university application is approved or rejected.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">5. Intellectual Property Rights</h2>
          <p>
            All content, branding, logos, graphics, copy, articles, software, and media on this website are the
            intellectual property of {companyData.name} and are protected under the Copyright Act, 2000 and
            Trademarks Act, 2009 of Bangladesh. Unlawful copying, distribution, or reproduction of website content
            without written permission is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under Bangladesh law, {companyData.name} and its directors, employees,
            or partners shall not be held liable for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Rejection of university applications or student visas by relevant foreign authorities.</li>
            <li>
              Financial losses resulting from currency exchange rate fluctuations, flight cancellations, or changes
              in immigration/visa policies of foreign governments.
            </li>
            <li>
              Any indirect, incidental, or consequential damages resulting from website downtime, technical issues,
              or delays caused by third parties.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">7. Privacy and Data Usage</h2>
          <p>
            Your privacy is crucial to us. The personal data, academic records, and contact details you provide
            through our website or portal are handled strictly in accordance with our{' '}
            <a href="/privacy-policy" className="text-primary-600 font-semibold hover:underline">Privacy Policy</a>,
            which forms an integral part of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">8. User Conduct &amp; Prohibited Activities</h2>
          <p>When using our website, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Attempt unauthorized access to our web servers, database systems, or networks.</li>
            <li>Submit false or misleading inquiries, spam, or malicious software (viruses/malware).</li>
            <li>Defame, harass, or misrepresent the Company, its staff, or partner institutions online or offline.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">9. Third-Party Links</h2>
          <p>
            Our website may contain links to external university portals, government immigration sites, or payment
            gateways. We have no control over the content, policies, or security of third-party websites and assume
            no responsibility for them.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">10. Amendments to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms and Conditions at any time without prior notice.
            Continued use of the website following any changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="font-outfit text-xl font-bold text-ink-900 mb-3">11. Contact Information</h2>
          <p>For any questions, legal notices, or inquiries regarding these Terms and Conditions, please contact:</p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Company Name:</strong> Just Go Study</li>
            <li>
              <strong>Office Address:</strong> Kha-76/A, Samata Sky View, Flat# 6B, Shahjadpur, Gulshan-2,
              Dhaka-1212, Bangladesh.
            </li>
            <li>
              <strong>Phone:</strong>{' '}
              <a href="tel:+8801901366830" className="text-primary-600 font-semibold hover:underline">+880 1901366830</a>
            </li>
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:justgostudy25@gmail.com" className="text-primary-600 font-semibold hover:underline">justgostudy25@gmail.com</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfService;
