import { validatePassword } from 'firebase/auth';

export const PASSWORD_HINT = 'Min. 10 characters, with uppercase, lowercase, number & special character';

// Checks the password live against the policy configured in Firebase Console
// (Authentication > Settings > Password policy), so the rule never drifts
// out of sync with a hand-maintained regex.
export const getPasswordValidationError = async (auth, password) => {
  const status = await validatePassword(auth, password);
  if (status.isValid) return '';
  if (status.meetsMinPasswordLength === false) return 'Password must be at least 10 characters';
  if (status.containsUppercaseLetter === false) return 'Password must contain an uppercase character';
  if (status.containsLowercaseLetter === false) return 'Password must contain a lowercase character';
  if (status.containsNumericCharacter === false) return 'Password must contain a numeric character';
  if (status.containsNonAlphanumericCharacter === false) return 'Password must contain a special character';
  return 'Password does not meet the required policy';
};
