// Single source of truth for the "Our Success" stat VALUES shown across the
// site (home Stats section, home Success highlight, Our Success page,
// About page's "Countries We Serve" banner) whenever the live, admin-managed
// /api/success data hasn't loaded yet or the request fails. Update a number
// here once instead of separately in every file that renders it.
//
// The real numbers shown on the live site are admin-managed content (see
// /admin/success), these are only the offline/loading fallback — keep them
// in sync with that admin content so the fallback never visibly disagrees
// with the real thing.
export const FALLBACK_STUDENTS_PLACED = '5000+';
export const FALLBACK_SUCCESS_RATE = '90%';
export const FALLBACK_PARTNER_UNIVERSITIES = '500+';
export const FALLBACK_COUNTRIES_COVERED = '70+';
export const FALLBACK_SCHOLARSHIPS_SECURED = '$2.5M+';
export const FALLBACK_VISA_APPROVAL_TIME = '15 Days';
