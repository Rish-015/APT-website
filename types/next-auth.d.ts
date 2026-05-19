import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isApproved: boolean;
      mustChangePassword: boolean;
      state?: string | null;
      region?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isApproved: boolean;
    mustChangePassword: boolean;
    state?: string | null;
    region?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isApproved: boolean;
    mustChangePassword: boolean;
    state?: string | null;
    region?: string | null;
  }
}
