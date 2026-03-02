import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    const tasks = await prisma.task.findMany({
        where:
            role === "admin"
                ? { isDeletedByAdmin: false }
                : {
                    assignedToId: userId,
                    isDeletedByEmployee: false
                },
        include: {
            project: { select: { title: true } },
            assignedTo: { select: { fullName: true } },
            createdBy: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    // Serialise dates for the client
    const serialised = tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-6">
            {/* Page header */}
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

            {/* Client component handles tabs, view modal, delete */}
            <TasksClient tasks={serialised as any} role={role} userId={userId} />
        </div>
    );
}
