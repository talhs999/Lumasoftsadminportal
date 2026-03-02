"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Building2,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

const adminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/dashboard/clients", label: "Clients", icon: Building2 },
    { href: "/dashboard/employees", label: "Employees", icon: Users },
];

const employeeNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "My Tasks", icon: CheckSquare },
];

interface SidebarProps {
    role: string;
    collapsed?: boolean;
    onToggle?: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({
    role,
    collapsed = false,
    onToggle,
    mobileOpen = false,
    onMobileClose,
}: SidebarProps) {
    const pathname = usePathname();
    const navItems = role === "admin" ? adminNavItems : employeeNavItems;

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full bg-brand-primary z-30 transition-all duration-300 flex flex-col border-r border-brand-border
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 p-4 border-b border-brand-border min-h-[72px]">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        <Image src="/logo.png" alt="Luma Softs Logo" width={40} height={40} className="object-contain" priority />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white font-semibold text-sm leading-tight truncate">
                                Luma Softs
                            </p>
                            <p className="text-brand-muted text-xs truncate">Admin Portal</p>
                        </div>
                    )}
                    <button
                        onClick={onMobileClose}
                        className="ml-auto text-gray-400 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive(href)
                                    ? "bg-brand-accent text-black shadow-lg shadow-brand-accent/20"
                                    : "text-brand-muted hover:bg-white/5 hover:text-white"
                                }
              `}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Toggle Button - Desktop */}
                <div className="p-3 border-t border-white/10 hidden lg:block">
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            </aside>
        </>
    );
}
