"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/projects": "Projects",
    "/dashboard/projects/create": "Create Project",
    "/dashboard/tasks": "Tasks",
    "/dashboard/tasks/create": "Create Task",
    "/dashboard/employees": "Employees",
    "/dashboard/clients": "Clients",
};

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = session?.user?.role ?? "employee";
    const userName = session?.user?.name ?? "User";
    const isTestUser = session?.user?.isTestUser ?? false;

    const getTitle = () => {
        for (const [path, title] of Object.entries(pageTitles)) {
            if (pathname === path) return title;
        }
        // Dynamic routes
        if (pathname.startsWith("/dashboard/projects/")) return "Project Details";
        return "Dashboard";
    };

    return (
        <div className="min-h-screen bg-brand-primary flex">
            <Sidebar
                role={role}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"
                    }`}
            >
                {/* Test Mode Banner */}
                {isTestUser && (
                    <div className="w-full bg-yellow-500/20 border-b border-yellow-500/40 px-4 py-2 flex items-center justify-center gap-2 text-yellow-400 text-sm font-medium">
                        <span>⚠️</span>
                        <span>
                            <strong>Test / Demo Mode</strong> — You are viewing simulated data. No real changes will be made to the database.
                        </span>
                    </div>
                )}
                <Navbar
                    title={getTitle()}
                    userName={userName}
                    role={role}
                    onMobileMenuToggle={() => setMobileOpen(true)}
                />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
