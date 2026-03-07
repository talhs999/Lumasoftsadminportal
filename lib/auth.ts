import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const MAX_ATTEMPTS = 5;          // lock after 5 failed attempts
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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
                    // Don't reveal whether email exists (security best practice)
                    throw new Error("Invalid email or password");
                }

                // ── Brute-force lockout check ──────────────────────────────
                if (user.lockedUntil && user.lockedUntil > new Date()) {
                    const remaining = Math.ceil(
                        (user.lockedUntil.getTime() - Date.now()) / 60000
                    );
                    throw new Error(
                        `Account locked due to too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`
                    );
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    // Increment failed attempts
                    const newAttempts = user.loginAttempts + 1;
                    const shouldLock = newAttempts >= MAX_ATTEMPTS;

                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            loginAttempts: newAttempts,
                            lockedUntil: shouldLock
                                ? new Date(Date.now() + LOCK_DURATION_MS)
                                : null,
                        },
                    });

                    if (shouldLock) {
                        throw new Error(
                            `Too many failed attempts. Account locked for 15 minutes.`
                        );
                    }

                    throw new Error(
                        `Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`
                    );
                }

                // ── Login success: reset lockout counter ───────────────────
                if (user.loginAttempts > 0 || user.lockedUntil) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { loginAttempts: 0, lockedUntil: null },
                    });
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
        maxAge: 8 * 60 * 60, // 8 hours (was 7 days — reduced for security)
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
