import { betterAuth } from "better-auth";
import { supabaseAdapter } from "better-auth/adapters/supabase";
import { emailVerificationPlugin } from "better-auth/plugins";

// Hong Kong universities domain whitelist
const HK_UNIVERSITY_DOMAINS = [
  "connect.polyu.hk",
  "link.cuhk.edu.hk",
  "cmail.carleton.ca", // Placeholder - replace with actual domains
  "student.ouhk.edu.hk",
  "student.hkust.edu.hk",
  "student.hku.hk",
  "student.cityu.edu.hk",
  "student.eduhk.hk",
];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("Missing BETTER_AUTH_SECRET environment variable");
}

export const auth = betterAuth({
  database: supabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    autoSignInAfterSignUp: false, // Require email verification first
  },
  plugins: [
    emailVerificationPlugin({
      sendVerificationEmail: async ({ user, token, url }) => {
        // Verify domain
        const email = user.email;
        const domain = email.split("@")[1];
        
        if (!HK_UNIVERSITY_DOMAINS.includes(domain)) {
          throw new Error(
            `Email domain ${domain} is not authorized. Only Hong Kong university domains are allowed.`
          );
        }

        // Send verification email
        // TODO: Implement email sending (using SendGrid, Resend, etc.)
        console.log(`[DEV] Verification email would be sent to ${email}`);
        console.log(`[DEV] Verification link: ${url}?token=${token}`);

        // For development, you can auto-verify by modifying the user record
        // In production, users will receive an email with verification link
      },
    }),
  ],
  callbacks: {
    async signUp({ user }) {
      // Extract domain from email
      const domain = user.email.split("@")[1];
      
      // Verify domain is whitelisted
      if (!HK_UNIVERSITY_DOMAINS.includes(domain)) {
        throw new Error(
          `Email domain ${domain} is not authorized. Only Hong Kong university domains are allowed.`
        );
      }

      return user;
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
