// Formats a raw user role (e.g. 'super_admin') into a display label (e.g. 'Super Admin')
export const formatRole = (role) => {
  if (role === 'super_admin') return 'Super Admin';
  return role.charAt(0).toUpperCase() + role.slice(1);
};
