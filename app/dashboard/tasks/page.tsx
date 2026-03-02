import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import TaskStatusUpdater from "./TaskStatusUpdater";

export default async function TasksPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    const tasks = await prisma.task.findMany({
        where:
            role === "admin"
                ? undefined
                : { assignedToId: userId },
        include: {
            project: { select: { title: true } },
            assignedTo: { select: { fullName: true } },
            createdBy: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-brand-text">
                        {role === "admin" ? "All Tasks" : "My Tasks"}
                    </h1>
                    <p className="text-brand-muted text-sm">{tasks.length} tasks total</p>
                </div>
                {role === "admin" && (
                    <Link
                        href="/dashboard/tasks/create"
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        New Task
                    </Link>
                )}
            </div>

            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 text-xs text-brand-muted uppercase tracking-wider">
                                <th className="text-left px-6 py-4">Title</th>
                                <th className="text-left px-6 py-4">Project</th>
                                <th className="text-left px-6 py-4">Priority</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-left px-6 py-4">Due Date</th>
                                <th className="text-left px-6 py-4">Assigned To</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {tasks.map((task: any) => (
                                <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-brand-text text-sm">
                                        {task.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-muted">
                                        {task.project.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`priority-${task.priority} capitalize`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <TaskStatusUpdater
                                            taskId={task.id}
                                            currentStatus={task.status}
                                            canEdit={role === "admin" || task.assignedToId === userId}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-muted">
                                        {task.dueDate
                                            ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-muted">
                                        {task.assignedTo?.fullName ?? "Unassigned"}
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-14 text-brand-muted text-sm"
                                    >
                                        No tasks found
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
