import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import DeleteProjectButton from "./DeleteProjectButton";

export default async function ProjectsPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    const projects = await prisma.project.findMany({
        where:
            role === "admin"
                ? undefined
                : {
                    OR: [
                        { createdById: userId },
                        { tasks: { some: { assignedToId: userId } } },
                    ],
                },
        include: {
            client: { select: { name: true } },
            createdBy: { select: { fullName: true } },
            tasks: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-brand-text">
                        {role === "admin" ? "All Projects" : "My Projects"}
                    </h1>
                    <p className="text-brand-muted text-sm">{projects.length} projects total</p>
                </div>
                <Link
                    href="/dashboard/projects/create"
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus size={16} />
                    New Project
                </Link>
            </div>

            {/* Table */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 text-xs text-brand-muted uppercase tracking-wider">
                                <th className="text-left px-6 py-4">Title</th>
                                <th className="text-left px-6 py-4">Client</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-left px-6 py-4">Budget</th>
                                <th className="text-left px-6 py-4">Deadline</th>
                                <th className="text-left px-6 py-4">Tasks</th>
                                <th className="text-left px-6 py-4">Created By</th>
                                <th className="text-left px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {projects.map((project: any) => {
                                const canEdit =
                                    role === "admin" || project.createdById === userId;
                                return (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-brand-text text-sm">
                                            {project.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.client?.name ?? "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-${project.status} capitalize`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.budget
                                                ? `PKR ${project.budget.toLocaleString()}`
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.deadline
                                                ? new Date(project.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.tasks.length}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {project.createdBy.fullName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/projects/${project.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                                {canEdit && (
                                                    <Link
                                                        href={`/dashboard/projects/${project.id}?edit=true`}
                                                        className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={15} />
                                                    </Link>
                                                )}
                                                {role === "admin" && (
                                                    <DeleteProjectButton projectId={project.id} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {projects.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-14 text-brand-muted text-sm"
                                    >
                                        No projects yet.{" "}
                                        <Link
                                            href="/dashboard/projects/create"
                                            className="text-brand-accent hover:underline"
                                        >
                                            Create one
                                        </Link>
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
