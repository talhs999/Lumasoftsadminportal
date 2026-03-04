"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(
                    result.error === "CredentialsSignin"
                        ? "Invalid email or password."
                        : result.error
                );
                setLoading(false);
            } else if (result?.ok) {
                // Refresh the router so middleware picks up the new session cookie,
                // then navigate to dashboard.
                router.refresh();
                router.push("/dashboard");
            } else {
                setError("Something went wrong. Please try again.");
                setLoading(false);
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Card */}
                <div className="flex justify-center mb-8">
                    <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-brand-accent shadow-2xl relative">
                        <Image src="/logo.png" alt="Luma Softs Logo" width={160} height={160} className="object-contain scale-[1.25]" priority quality={100} />
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-brand-secondary border border-brand-border rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-brand-text mb-1">
                        Welcome back
                    </h2>
                    <p className="text-brand-muted text-sm mb-6">
                        Sign in to your account to continue
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@lumasofts.com"
                                className="input-field"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Access restricted to Luma Softs team members only
                    </p>
                </div>
            </div>
        </div>
    );
}
