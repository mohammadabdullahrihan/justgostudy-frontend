import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import * as popupService from '../../services/popupService';

const SHOWN_KEY = 'site-popup-shown';

const matchesPage = (targetPages, pathname) => {
  if (!targetPages || targetPages.trim().toLowerCase() === 'all') return true;
  return targetPages.split(',').map((p) => p.trim()).includes(pathname);
};

const SitePopup = () => {
  const location = useLocation();
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY)) return;
    let ignore = false;
    popupService.getPopups({ activeOnly: 'true' })
      .then((data) => {
        if (ignore || !Array.isArray(data)) return;
        const match = data.find((p) => matchesPage(p.targetPages, location.pathname));
        if (match) setPopup(match);
      })
      .catch(() => {});
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reveal = useCallback(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    setVisible(true);
    sessionStorage.setItem(SHOWN_KEY, '1');
    popupService.trackPopupView(popup._id).catch(() => {});
  }, [popup]);

  useEffect(() => {
    if (!popup) return undefined;

    if (popup.trigger === 'delay') {
      const timer = setTimeout(reveal, (popup.delaySeconds || 5) * 1000);
      return () => clearTimeout(timer);
    }

    if (popup.trigger === 'exit_intent') {
      const handleMouseLeave = (e) => {
        if (e.clientY <= 0) reveal();
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }

    if (popup.trigger === 'scroll') {
      const handleScroll = () => {
        const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        if (scrolled > 0.5) reveal();
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    return undefined;
  }, [popup, reveal]);

  if (!popup || !visible) return null;

  const handleClick = () => {
    popupService.trackPopupClick(popup._id).catch(() => {});
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden relative">
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute right-4 top-4 p-2 bg-white/90 rounded-full hover:bg-ink-100 transition-colors z-10"
        >
          <X className="w-4 h-4 text-ink-500" />
        </button>
        {popup.imageUrl && (
          <img src={popup.imageUrl} alt={popup.title || ''} className="w-full h-40 object-cover" />
        )}
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-ink-900 mb-2">{popup.title}</h3>
          <p className="text-ink-500 text-sm mb-6">{popup.content}</p>
          {popup.ctaText && popup.ctaLink && (
            <a
              href={popup.ctaLink}
              onClick={handleClick}
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
            >
              {popup.ctaText}
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SitePopup;
