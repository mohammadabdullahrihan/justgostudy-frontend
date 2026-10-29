import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behavior: locks body scroll while open, closes on Escape,
 * and traps Tab focus within the modal container while it's open.
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @returns {import('react').RefObject} ref to attach to the modal's outer container
 */
export const useModalA11y = (isOpen, onClose) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previouslyFocused = document.activeElement;
    const container = containerRef.current;
    const focusable = container ? container.querySelectorAll(FOCUSABLE_SELECTOR) : [];
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const nodes = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [isOpen, onClose]);

  return containerRef;
};
