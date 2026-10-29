const STORAGE_KEY = 'cookie-consent';
const EVENT_NAME = 'cookie-consent-change';

export const getCookieConsent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// Also broadcasts the change so already-mounted components (e.g. Seo, which
// decides whether to inject the GA snippet) react immediately instead of
// only picking up the choice on next page load.
export const setCookieConsent = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable (private mode/blocked) — the dispatched event below
    // still lets the rest of this session honor the choice
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
};

export const onCookieConsentChange = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
