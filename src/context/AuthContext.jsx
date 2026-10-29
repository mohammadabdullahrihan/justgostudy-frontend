import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { syncLanguageProgress } from '../services/languageService';

// Firebase (~150kB gzipped) is only ever needed for the login/register/reset
// flows, never to render a page, importing it statically here would pull it
// into the eager entry bundle since AuthProvider wraps the whole app
// unconditionally in main.jsx. Loading it on demand keeps it out of every
// page's initial JS payload.
const loadFirebaseAuth = () => import('firebase/auth');
const loadFirebaseConfig = () => import('../config/firebase');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Synchronously load the user profile if a token exists on application mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Fetch the profile of the token owner
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to authenticate token:', error.message);
          // Token is invalid/expired; clear session
          handleLogout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // One-time reconciliation of Language Club progress a student may have
  // built up anonymously (localStorage) before creating an account, so it
  // isn't silently lost the first time they log in.
  useEffect(() => {
    if (!user || user.role !== 'student') return;
    if (sessionStorage.getItem('langProgressSynced')) return;

    const reconcile = async () => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('lang_progress_'));
      for (const key of keys) {
        const languageId = key.replace('lang_progress_', '');
        let ids = [];
        try {
          ids = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
          continue;
        }
        if (ids.length === 0) continue;
        try {
          const result = await syncLanguageProgress(languageId, ids);
          setUser((prev) => (prev ? { ...prev, points: result.points, level: result.level, streak: result.streak, badges: result.badges } : prev));
        } catch (error) {
          console.error('Language progress reconciliation failed:', error.message);
        }
      }
      sessionStorage.setItem('langProgressSynced', '1');
    };

    reconcile();
  }, [user]);

  // Catch custom global Axios logout events (401 Unauthorized errors from api.js)
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Persist a login response to localStorage and state
   * @param {Object} sessionData - Response containing _id, name, email, role, token
   */
  const applySession = (sessionData) => {
    localStorage.setItem('token', sessionData.token);
    setToken(sessionData.token);
    const sessionUser = {
      _id: sessionData._id,
      name: sessionData.name,
      email: sessionData.email,
      role: sessionData.role,
      authProvider: sessionData.authProvider,
      points: sessionData.points,
      level: sessionData.level,
      streak: sessionData.streak,
      badges: sessionData.badges,
    };
    setUser(sessionUser);
    return sessionUser;
  };

  /**
   * Log in with email + password via Firebase, then exchange the ID token
   * for an app session.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const [{ signInWithEmailAndPassword }, { auth }] = await Promise.all([loadFirebaseAuth(), loadFirebaseConfig()]);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const loginData = await authService.firebaseLogin(idToken);
      const sessionUser = applySession(loginData);
      setLoading(false);
      return sessionUser;
    } catch (error) {
      setLoading(false);
      throw mapFirebaseAuthError(error);
    }
  };

  /**
   * Sign in with a Firebase popup provider (Google/GitHub/Microsoft) and
   * exchange the resulting ID token for an app session.
   * @param {import('firebase/auth').AuthProvider} provider
   */
  const socialSignIn = async (providerKey) => {
    setLoading(true);
    try {
      const [{ signInWithPopup }, { googleProvider, githubProvider, microsoftProvider, auth }] = await Promise.all([
        loadFirebaseAuth(),
        loadFirebaseConfig(),
      ]);
      const provider = { google: googleProvider, github: githubProvider, microsoft: microsoftProvider }[providerKey];
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const loginData = await authService.firebaseLogin(idToken);
      const sessionUser = applySession(loginData);
      setLoading(false);
      return sessionUser;
    } catch (error) {
      setLoading(false);
      throw mapFirebaseAuthError(error);
    }
  };

  const loginWithGoogle = () => socialSignIn('google');
  const loginWithGithub = () => socialSignIn('github');
  const loginWithMicrosoft = () => socialSignIn('microsoft');

  /**
   * Register a new user with email + password via Firebase, send our own
   * branded verification email (via the backend + Brevo, not Firebase's
   * plain-text default), and sync the profile (role) to our backend.
   * @param {Object} userData - { name, email, password, role, phone, referralCode, agentProfile }
   * @param {Object} [userData.agentProfile] - Agent-specific registration fields (only sent
   *   when role === 'agent'), persisted immediately into an AgentProfile document by
   *   authController.js's verifyAndSyncUser. See Register.jsx's agent-specific step.
   */
  const register = async ({ name, email, password, role, phone, referralCode, agentProfile }) => {
    setLoading(true);
    try {
      const [{ createUserWithEmailAndPassword }, { auth }] = await Promise.all([
        loadFirebaseAuth(),
        loadFirebaseConfig(),
      ]);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Verification is no longer required to use the account — still sent
      // so users can verify if they want, but registration no longer blocks on it.
      await authService.sendVerificationEmail(email);

      const idToken = await userCredential.user.getIdToken();
      const loginData = await authService.firebaseLogin(idToken, { name, role, phone, referralCode, agentProfile });
      const sessionUser = applySession(loginData);

      setLoading(false);
      return {
        ...sessionUser,
        message: 'Registration successful.',
        email,
      };
    } catch (error) {
      setLoading(false);
      throw mapFirebaseAuthError(error);
    }
  };

  /**
   * Send our own branded password-reset email (backend + Brevo). The backend
   * always responds with the same generic message regardless of whether the
   * account exists, so there's nothing account-specific to branch on here.
   * @param {string} email
   */
  const forgotPassword = async (email) => {
    const response = await authService.sendPasswordReset(email);
    return { message: response.message };
  };

  /**
   * Resend our own branded verification email to the currently signed-in
   * (but unverified) user. Requires an active Firebase session just to read
   * which email address to resend to.
   */
  const resendVerificationEmail = async () => {
    const { auth } = await loadFirebaseConfig();
    if (!auth.currentUser) {
      throw new Error('Your session has expired. Please log in again to resend the verification email.');
    }
    await authService.sendVerificationEmail(auth.currentUser.email);
  };

  /**
   * Perform logout operation
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
    Promise.all([loadFirebaseAuth(), loadFirebaseConfig()])
      .then(([{ signOut }, { auth }]) => signOut(auth))
      .catch((error) => console.error('Firebase sign-out error:', error.message));
  };

  const logout = () => {
    handleLogout();
  };

  /**
   * Update current user in local state
   * @param {Object} updatedUser
   */
  const updateUser = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  const contextValue = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    loginWithGithub,
    loginWithMicrosoft,
    register,
    forgotPassword,
    resendVerificationEmail,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook to use the Auth Context
 */
// eslint-disable-next-line react-refresh/only-export-components -- provider + hook intentionally co-located
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
