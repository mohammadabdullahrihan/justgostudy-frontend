import { useState, useEffect, useRef } from 'react';

export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          if (!options.triggerOnce) {
            setHasAnimated(true);
          }
        } else if (!options.triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold: options.threshold || 0.2,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.triggerOnce]);

  return { ref, isInView, hasAnimated };
};

export default useInView;
