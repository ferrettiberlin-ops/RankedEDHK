/**
 * Authentication utilities
 * User data is stored anonymously in Supabase via review submission flow
 */

export const HK_UNIVERSITY_DOMAINS = [
  "connect.polyu.hk",
  "link.cuhk.edu.hk",
  "student.ouhk.edu.hk",
  "student.hkust.edu.hk",
  "student.hku.hk",
  "student.cityu.edu.hk",
  "student.eduhk.hk",
];

export function validateUniversityEmail(email: string): boolean {
  const domain = email.split("@")[1];
  return HK_UNIVERSITY_DOMAINS.includes(domain);
}
