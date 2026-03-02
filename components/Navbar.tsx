"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, LogOut, Bell, Sun, Moon } from "lucide-react";

interface NavbarProps {
    title: string;
    userName: string;
    role: string;
    onMobileMenuToggle?: () => void;
}

export default function Navbar({
    title,
    userName,
    role,
    onMobileMenuToggle,
}: NavbarProps) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 bg-brand-secondary border-b border-brand-border px-4 flex items-center justify-between sticky top-0 z-10">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMobileMenuToggle}
                    className="p-1.5 rounded-lg hover:bg-brand-border text-brand-muted lg:hidden transition-colors"
                >
                    <Menu size={20} />
                </button>
                <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg hover:bg-brand-border text-brand-muted transition-colors"
                    title="Toggle Theme"
                >
                    {mounted && theme === "dark" ? (
                        <Sun size={18} />
                    ) : mounted && theme === "light" ? (
                        <Moon size={18} />
                    ) : (
                        <div className="w-[18px] h-[18px]"></div>
                    )}
                </button>

                {/* Notification bell */}
                <button className="p-2 rounded-lg hover:bg-brand-border text-brand-muted transition-colors relative">
                    <Bell size={18} />
                </button>

                {/* User info */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-brand-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-brand-text leading-tight">
                            {userName}
                        </p>
                        <span
                            className={`text-xs font-medium ${role === "admin" ? "text-brand-accent" : "text-blue-400"
                                }`}
                        >
                            {role === "admin" ? "Administrator" : "Employee"}
                        </span>
                    </div>
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-black text-sm font-bold flex-shrink-0
            ${role === "admin" ? "bg-brand-accent" : "bg-blue-400"}`}
                    >
                        {userName?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="ml-1 p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-brand-muted transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
