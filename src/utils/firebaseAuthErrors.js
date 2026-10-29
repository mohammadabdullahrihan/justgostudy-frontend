// Firebase Auth throws errors as `{ code: 'auth/...' }` directly from the SDK
// (not through our axios interceptor), so they need their own friendly mapping.
const MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak.',
  'auth/password-does-not-meet-requirements': 'Password does not meet the required policy.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different sign-in method.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid or has already been used.',
  'auth/requires-recent-login': 'For security, please log out and log back in, then try again.',
};

export const mapFirebaseAuthError = (error) => {
  const message = MESSAGES[error?.code];
  return new Error(message || error?.message || 'Something went wrong. Please try again.');
};
