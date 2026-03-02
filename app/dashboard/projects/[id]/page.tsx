import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, Banknote, User, Plus } from "lucide-react";
import EditProjectClient from "./EditProjectClient";
import TaskStatusUpdater from "../../tasks/TaskStatusUpdater";
import DeleteProjectButton from "../DeleteProjectButton";

export default async function ProjectDetailPage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { edit?: string };
}) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: {
            client: true,
            createdBy: { select: { fullName: true } },
            tasks: {
                include: {
                    assignedTo: { select: { fullName: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!project) notFound();

    const canEdit = role === "admin" || project.createdById === userId;
    const clients = await prisma.client.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    if (searchParams.edit === "true" && canEdit) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F172A] transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </Link>
                <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm p-6">
                    <h1 className="text-xl font-bold text-brand-text mb-6">
                        Edit Project
                    </h1>
                    <EditProjectClient project={project} clients={clients} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F172A]"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>

            {/* Project Header */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-text">
                            {project.title}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {project.description ?? "No description"}
                        </p>
                    </div>
                    <span className={`status-${project.status} capitalize text-sm`}>
                        {project.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm">
                        <User size={15} className="text-brand-muted" />
                        <div>
                            <p className="text-xs text-brand-muted">Client</p>
                            <p className="font-medium text-brand-text">{project.client?.name ?? "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Banknote size={15} className="text-brand-muted" />
                        <div>
                            <p className="text-xs text-brand-muted">Budget</p>
                            <p className="font-medium text-brand-text">
                                {project.budget ? `PKR ${project.budget.toLocaleString()}` : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={15} className="text-brand-muted" />
                        <div>
                            <p className="text-xs text-brand-muted">Deadline</p>
                            <p className="font-medium text-brand-text">
                                {project.deadline
                                    ? new Date(project.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <User size={15} className="text-brand-muted" />
                        <div>
                            <p className="text-xs text-brand-muted">Created By</p>
                            <p className="font-medium text-brand-text">{project.createdBy.fullName}</p>
                        </div>
                    </div>
                </div>

                {(canEdit || role === "admin") && (
                    <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-3">
                        {canEdit && (
                            <Link
                                href={`/dashboard/projects/${project.id}?edit=true`}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <Edit size={16} />
                                Edit Project
                            </Link>
                        )}
                        {role === "admin" && (
                            <DeleteProjectButton projectId={project.id} redirectUrl="/dashboard/projects" />
                        )}
                    </div>
                )}
            </div>

            {/* Tasks */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm">
                <div className="p-6 border-b border-brand-border flex items-center justify-between">
                    <h2 className="text-base font-semibold text-brand-text">
                        Tasks ({project.tasks.length})
                    </h2>
                    {role === "admin" && (
                        <Link
                            href={`/dashboard/tasks/create?projectId=${project.id}`}
                            className="btn-primary text-sm flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Add Task
                        </Link>
                    )}
                </div>
                <div className="divide-y divide-brand-border">
                    {project.tasks.map((task: any) => (
                        <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                            <div>
                                <p className="text-sm font-medium text-brand-text">{task.title}</p>
                                <p className="text-xs text-brand-muted">
                                    Assigned to: {task.assignedTo?.fullName ?? "Unassigned"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`priority-${task.priority}`}>{task.priority}</span>
                                <span className={`status-${task.status} capitalize`}>{task.status.replace("_", " ")}</span>
                            </div>
                        </div>
                    ))}
                    {project.tasks.length === 0 && (
                        <div className="text-center py-10 text-brand-muted text-sm">
                            No tasks added yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
