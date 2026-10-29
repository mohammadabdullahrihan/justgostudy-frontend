import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Wraps the "did this student just complete something" branch shared by
// LanguageLearnPage and LanguageFlashcards: logged-in students get their
// progress synced to their account; anonymous visitors see a signup prompt;
// any other logged-in role (agent/university/educator/admin/super_admin)
// already has an account and isn't the target audience for a student
// profile, so they're left alone — no sync, no nag. Never touches
// localStorage — callers keep their existing anonymous-path persistence
// untouched.
export const useAchievementGate = () => {
  const { user, updateUser } = useAuth();
  const [modalContent, setModalContent] = useState(null); // null | { title, message }

  const gate = async (promptContent, syncFn) => {
    if (user && user.role === 'student') {
      try {
        const result = await syncFn();
        updateUser({ points: result.points, level: result.level, streak: result.streak, badges: result.badges });
        (result.newlyAwarded || []).forEach((badgeId) => toast.success(`Badge unlocked: ${badgeId}`));
      } catch (error) {
        console.error('Progress sync failed:', error);
      }
      return;
    }
    if (user) return; // logged in as a non-student role — silent, no nag
    setModalContent(promptContent);
  };

  return { modalContent, closeModal: () => setModalContent(null), gate };
};
