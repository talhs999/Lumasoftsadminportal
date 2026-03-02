import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardCard from "@/components/DashboardCard";
import {
    Users,
    FolderKanban,
    Banknote,
    Clock,
    CheckSquare,
    AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (role === "admin") {
        // Admin stats
        const [clientCount, activeProjects, allProjects] = await Promise.all([
            prisma.client.count(),
            prisma.project.count({ where: { status: "ongoing" } }),
            prisma.project.findMany({ select: { budget: true, status: true } }),
        ]);

        const monthlyRevenue = allProjects
            .filter((p: any) => p.status === "completed")
            .reduce((sum: number, p: any) => sum + (p.budget ?? 0), 0);

        const recentProjects = await prisma.project.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { client: true, createdBy: true },
        });

        return (
            <div className="space-y-6">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">
                        Welcome back, {session?.user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-brand-muted text-sm mt-1">
                        Here&apos;s what&apos;s happening at Luma Softs today
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <DashboardCard
                        title="Total Clients"
                        value={clientCount}
                        icon={Users}
                        color="blue"
                    />
                    <DashboardCard
                        title="Active Projects"
                        value={activeProjects}
                        icon={FolderKanban}
                        color="brand"
                    />
                    <DashboardCard
                        title="Pending Projects"
                        value={allProjects.filter((p: any) => p.status === "pending").length}
                        icon={Clock}
                        color="orange"
                    />
                    <DashboardCard
                        title="Monthly Revenue (PKR)"
                        value={monthlyRevenue}
                        icon={Banknote}
                        color="green"
                    />
                </div>

                {/* Recent Projects Table */}
                <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm">
                    <div className="p-6 border-b border-brand-border">
                        <h2 className="text-base font-semibold text-brand-text">
                            Recent Projects
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-brand-muted uppercase tracking-wider border-b border-brand-border">
                                    <th className="text-left px-6 py-3">Project</th>
                                    <th className="text-left px-6 py-3">Client</th>
                                    <th className="text-left px-6 py-3">Status</th>
                                    <th className="text-left px-6 py-3">Budget</th>
                                    <th className="text-left px-6 py-3">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map((project: any) => (
                                    <tr
                                        key={project.id}
                                        className="border-b border-brand-border hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-brand-text text-sm">
                                            {project.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.client?.name ?? "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-${project.status}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.budget ? `PKR ${project.budget.toLocaleString()}` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.createdBy.fullName}
                                        </td>
                                    </tr>
                                ))}
                                {recentProjects.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-center py-10 text-brand-muted text-sm"
                                        >
                                            No projects found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Employee Dashboard
    const [myProjects, myTasks] = await Promise.all([
        prisma.project.findMany({
            where: { createdById: userId },
            orderBy: { createdAt: "desc" },
            include: { client: true },
        }),
        prisma.task.findMany({
            where: { assignedToId: userId },
            orderBy: { dueDate: "asc" },
            include: { project: true },
        }),
    ]);

    const pendingTasks = myTasks.filter((t: any) => t.status !== "completed");
    const upcomingDeadlines = myTasks
        .filter((t: any) => t.dueDate && t.status !== "completed")
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-text">
                    Hello, {session?.user?.name?.split(" ")[0]} 👋
                </h1>
                <p className="text-brand-muted text-sm mt-1">Here&apos;s your work summary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DashboardCard
                    title="My Projects"
                    value={myProjects.length}
                    icon={FolderKanban}
                    color="brand"
                />
                <DashboardCard
                    title="Assigned Tasks"
                    value={myTasks.length}
                    icon={CheckSquare}
                    color="blue"
                />
                <DashboardCard
                    title="Pending Tasks"
                    value={pendingTasks.length}
                    icon={AlertCircle}
                    color="orange"
                />
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm">
                <div className="p-6 border-b border-brand-border">
                    <h2 className="text-base font-semibold text-brand-text">
                        Upcoming Deadlines
                    </h2>
                </div>
                <div className="divide-y divide-brand-border">
                    {upcomingDeadlines.map((task: any) => (
                        <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                            <div>
                                <p className="text-sm font-medium text-brand-text">{task.title}</p>
                                <p className="text-xs text-brand-muted">{task.project.title}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-brand-muted">
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                        : "No date"}
                                </p>
                                <span className={`priority-${task.priority} text-xs`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                    {upcomingDeadlines.length === 0 && (
                        <div className="text-center py-10 text-brand-muted text-sm">
                            No upcoming deadlines 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
