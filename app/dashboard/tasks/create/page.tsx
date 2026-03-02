import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TaskFormClient from "./TaskFormClient";

export default async function CreateTaskPage({
    searchParams,
}: {
    searchParams: { projectId?: string };
}) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "admin") redirect("/dashboard/tasks");

    const [projects, employees] = await Promise.all([
        prisma.project.findMany({
            select: { id: true, title: true },
            orderBy: { title: "asc" },
        }),
        prisma.user.findMany({
            select: { id: true, fullName: true },
            orderBy: { fullName: "asc" },
        }),
    ]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-white transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Tasks
            </Link>
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm p-6">
                <h1 className="text-xl font-bold text-brand-text mb-6">Create New Task</h1>
                <TaskFormClient
                    projects={projects}
                    employees={employees}
                    defaultProjectId={searchParams.projectId}
                />
            </div>
        </div>
    );
}
