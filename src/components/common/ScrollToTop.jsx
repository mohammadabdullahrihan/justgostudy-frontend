import React from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // When Lenis is active it owns the scroll position, jump through it so
    // the smoothed value doesn't lerp back to the previous page's offset.
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

export default ScrollToTop;
