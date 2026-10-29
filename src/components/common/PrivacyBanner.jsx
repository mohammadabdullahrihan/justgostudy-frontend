import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../../utils/privacyBanner';

// Bottom-center and full-bleed on mobile so it can't be missed the way a
// corner toast can — the WhatsApp bubble (StickyWhatsApp) sits bottom-right
// and never overlaps this since the card is centered, not left-anchored.
//
// Named PrivacyBanner (not CookieConsent) deliberately — ad-blockers'
// filter lists (EasyList/EasyPrivacy) commonly block any request whose URL
// contains "cookieconsent"/"cookie-consent", which silently killed this
// component's module fetch in dev and could do the same to its bundled
// chunk in prod. "Privacy" isn't on those lists.
const PrivacyBanner = () => {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, []);

  if (!visible) return null;

  const respond = (value) => {
    setCookieConsent(value);
    setEntered(false);
    setTimeout(() => setVisible(false), 200);
  };

  return (
    <div
      className={`fixed inset-x-4 bottom-5 z-40 mx-auto max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 shadow-2xl shadow-primary-900/40 ring-1 ring-white/10 transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <Cookie className="h-5 w-5 text-accent-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">We use cookies</h3>
            <p className="mt-1 text-sm text-white/70">
              We use cookies to improve your experience and understand site usage. Read our{' '}
              <Link
                to="/privacy-policy"
                className="font-semibold text-accent-400 underline underline-offset-2 hover:text-accent-300"
              >
                privacy policy
              </Link>{' '}
              to learn more.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => respond('declined')}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            Decline
          </button>
          <button
            onClick={() => respond('accepted')}
            className="flex-1 rounded-xl bg-accent-400 px-4 py-2 text-sm font-bold text-ink-900 shadow-theme-md transition-all duration-200 hover:bg-accent-300"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyBanner;
