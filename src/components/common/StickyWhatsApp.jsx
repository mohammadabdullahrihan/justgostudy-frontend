import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Same number used on the Contact page's social row, kept as the single
// direct-message channel for the Bangladeshi audience across the site.
const WHATSAPP_URL = 'https://wa.me/8801901366830';

const StickyWhatsApp = () => {
  const wrapperRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(wrapperRef.current, { opacity: 1, scale: 1 });
      return;
    }
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 1, ease: 'back.out(1.7)' }
    );
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8"
      style={{ opacity: 0 }}
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out hover:scale-110"
      >
        {/* Pulsing ring — mimics the real WhatsApp widget's "someone's here" cue */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-70 animate-ping [animation-duration:2s]" />

        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#25D366]">
          <img
            src="/whatsappicon.webp"
            alt=""
            className="h-8 w-8 object-contain drop-shadow-sm"
            draggable={false}
          />
        </span>

        {/* Hover tooltip, WhatsApp-web style */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 opacity-0 shadow-theme-lg transition-opacity duration-200 group-hover:opacity-100">
          Chat with us
          <span className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-white" />
        </span>
      </a>
    </div>
  );
};

export default StickyWhatsApp;
