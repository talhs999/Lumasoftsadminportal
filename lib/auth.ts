import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("No account found with this email");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                    username: user.username,
                    isTestUser: user.isTestUser,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.username = (user as any).username;
                token.name = user.name;
                token.isTestUser = (user as any).isTestUser ?? false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.username = token.username as string;
                session.user.name = token.name as string;
                session.user.isTestUser = token.isTestUser as boolean ?? false;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-luma-admin-portal-123",
};

export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }
    return session;
}

export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }
    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }
    return session;
}

export async function getSession() {
    return await getServerSession(authOptions);
}
