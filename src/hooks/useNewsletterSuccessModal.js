import { useSyncExternalStore } from 'react';

// Same shared-trigger pattern as useConsultationModal: a module-level store
// so any of the site's newsletter forms (Footer, StudyAbroadFooter,
// LanguageFooter, join/NewsletterSection) can open the one modal mounted
// once at the App root, without each holding its own modal state.
// `theme` lets a caller (e.g. LanguageFooter) request the modal's red
// palette instead of the site-wide default. `status` picks which copy shows:
// a fresh 'success' subscription vs an 'already' (email already active).
let isOpen = false;
let theme = 'primary';
let status = 'success';
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const openNewsletterSuccessModal = (modalTheme = 'primary', modalStatus = 'success') => {
  isOpen = true;
  theme = modalTheme;
  status = modalStatus;
  emit();
};

export const closeNewsletterSuccessModal = () => {
  isOpen = false;
  emit();
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getOpenSnapshot = () => isOpen;
const getThemeSnapshot = () => theme;
const getStatusSnapshot = () => status;

export const useNewsletterSuccessModalOpen = () => useSyncExternalStore(subscribe, getOpenSnapshot);
export const useNewsletterSuccessModalTheme = () => useSyncExternalStore(subscribe, getThemeSnapshot);
export const useNewsletterSuccessModalStatus = () => useSyncExternalStore(subscribe, getStatusSnapshot);
