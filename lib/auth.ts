import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Initialize a global Prisma Client to avoid exhausting database connections in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
// Re-triggering Prism Client HMR sync for schema updates

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any, // Cast for NextAuth v4 compatibility with @auth/prisma-adapter
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        newUser: "/register", // Redirect specifically if they just registered
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.email },
                            { phone: credentials.email }
                        ]
                    }
                });

                if (!user || !user?.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    state: user.state,
                    region: user.region,
                    latitude: user.latitude,
                    longitude: user.longitude,
                    landSize: user.landSize,
                    cropDetails: user.cropDetails,
                    // mustChangePassword: user.mustChangePassword,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // Expand the default session shape to include user ID and Role
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).state = token.state;
                (session.user as any).region = token.region;
                (session.user as any).latitude = token.latitude;
                (session.user as any).longitude = token.longitude;
                (session.user as any).landSize = token.landSize;
                (session.user as any).cropDetails = token.cropDetails;
                // (session.user as any).mustChangePassword = token.mustChangePassword;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.state = (user as any).state;
                token.region = (user as any).region;
                token.latitude = (user as any).latitude;
                token.longitude = (user as any).longitude;
                token.landSize = (user as any).landSize;
                token.cropDetails = (user as any).cropDetails;
                // token.mustChangePassword = (user as any).mustChangePassword;
            }
            return token;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
