import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

// Hong Kong universities domain whitelist
const HK_UNIVERSITY_DOMAINS = [
  "connect.polyu.hk",
  "link.cuhk.edu.hk",
  "student.ouhk.edu.hk",
  "student.hkust.edu.hk",
  "student.hku.hk",
  "student.cityu.edu.hk",
  "student.eduhk.hk",
  "student.hku.hk",
];

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("Missing BETTER_AUTH_SECRET environment variable");
}

/**
 * Better-Auth Configuration for RankedEDHK
 * 
 * Note: Currently uses in-memory adapter for development.
 * For production with Supabase persistence, implement custom adapter
 * that uses @supabase/supabase-js client directly.
 * 
 * Reference: User data is stored anonymously in Supabase users table
 * via the reviews submission flow, not through Better-Auth database.
 */
export const auth = betterAuth({
  database: memoryAdapter(), // In-memory for development; upgrade for production
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    autoSignInAfterSignUp: false, // Require email verification
  },
  user: {
    changeEmail: {
      enabled: false, // Lock email to prevent changes
    },
  },
  callbacks: {
    async signUp({ user }) {
      // Extract domain from email
      const domain = user.email!.split("@")[1];

      // Verify domain is whitelisted (HK universities only)
      if (!HK_UNIVERSITY_DOMAINS.includes(domain)) {
        throw new Error(
          `Email domain @${domain} is not authorized. Only Hong Kong university email addresses are allowed.`
        );
      }

      console.log(`✅ Approved signup for ${user.email} (${domain})`);
      return user;
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
