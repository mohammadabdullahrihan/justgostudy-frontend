import { Info } from 'lucide-react';

const UniversityDisclaimer = () => (
  <div className="mx-auto mb-4 max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-6 py-5 shadow-sm">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
      <p className="text-sm leading-relaxed text-primary-100 sm:text-base">
        <span className="font-bold text-white">Disclaimer:</span> Please note that the university name, logo, and
        other text are for your information only. Please refer to the university website for accurate, detailed
        information. Use of a university&apos;s name and logo is for identification purposes only and does not imply
        that there is a relationship between that University/Institute and us.
      </p>
    </div>
  </div>
);

export default UniversityDisclaimer;
