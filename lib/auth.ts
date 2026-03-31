/**
 * Authentication utilities
 * User data is stored anonymously in Supabase via review submission flow
 */

export const HK_UNIVERSITY_DOMAINS = [
  "@connect.hku.hk",
  "@link.cuhk.edu.hk",
  "@connect.ust.hk",
  "@connect.polyu.hk",
  "@my.cityu.edu.hk",
  "@life.hkbu.edu.hk",
  "@s.eduhk.hk",
  "@live.hkmu.edu.hk",
  "@ln.hk",
];

export function validateUniversityEmail(email: string): boolean {
  const domain = email.split("@")[1];
  return HK_UNIVERSITY_DOMAINS.includes(domain);
}
