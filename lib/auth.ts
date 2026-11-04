import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    // Turn on once you can send email (Resend, Postmark, etc.)
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: replace with a real email send. Logged for dev only.
      console.log(`Reset password for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // Link an email account and a GitHub login with the same email
  // into one user instead of creating a duplicate.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"],
      // Email verification is disabled, so local accounts are always
      // unverified. Without this, linking GitHub to an existing
      // email/password account fails with "account_not_linked".
      requireLocalEmailVerified: false,
    },
  },

  // Note: do not set onAPIError.errorURL to a dashboard-related path,
  // otherwise session reads can trigger redirect loops.


  plugins: [nextCookies()], // keep this last
});