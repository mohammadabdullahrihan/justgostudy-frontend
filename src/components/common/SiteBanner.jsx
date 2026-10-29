import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import * as bannerService from '../../services/bannerService';
import { BANNER_STYLE_CLASSES } from '../../constants/bannerStyles';

const dismissedKey = (id) => `dismissed-banner-${id}`;

const SiteBanner = () => {
  const [banner, setBanner] = useState(null);
  const trackedView = useRef(false);

  useEffect(() => {
    let ignore = false;
    bannerService.getBanners({ activeOnly: 'true' })
      .then((data) => {
        if (ignore || !Array.isArray(data) || data.length === 0) return;
        const live = data.find((b) => !sessionStorage.getItem(dismissedKey(b._id)));
        if (live) setBanner(live);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (banner && !trackedView.current) {
      trackedView.current = true;
      bannerService.trackBannerView(banner._id).catch(() => {});
    }
  }, [banner]);

  if (!banner) return null;

  const handleClick = () => {
    bannerService.trackBannerClick(banner._id).catch(() => {});
  };

  const handleDismiss = () => {
    sessionStorage.setItem(dismissedKey(banner._id), '1');
    setBanner(null);
  };

  return (
    <div className={`relative px-4 py-2.5 text-sm font-semibold text-center ${BANNER_STYLE_CLASSES[banner.style] || BANNER_STYLE_CLASSES.info}`}>
      <span>{banner.message}</span>
      {banner.link && (
        <a
          href={banner.link}
          onClick={handleClick}
          className="ml-2 underline underline-offset-2 hover:opacity-90"
        >
          {banner.linkText || 'Learn more'}
        </a>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SiteBanner;
