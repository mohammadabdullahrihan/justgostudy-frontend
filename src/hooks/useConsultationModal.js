import { useSyncExternalStore } from 'react';

// Module-level store so any page under StudyAbroadLayout can open the
// consultation modal without each one holding its own isOpen state and
// rendering its own <ConsultationModal>. The modal itself is mounted once,
// in StudyAbroadLayout; pages just call openConsultationModal().
let isOpen = false;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const openConsultationModal = () => {
  isOpen = true;
  emit();
};

export const closeConsultationModal = () => {
  isOpen = false;
  emit();
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => isOpen;

export const useConsultationModalOpen = () => useSyncExternalStore(subscribe, getSnapshot);
