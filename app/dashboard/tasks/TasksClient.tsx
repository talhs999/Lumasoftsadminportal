"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, X, Clock, Calendar, User, Layers, Flag, CheckCircle2, AlertTriangle } from "lucide-react";
import TaskStatusUpdater from "./TaskStatusUpdater";

interface TaskWithRelations {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    project: { title: string };
    assignedTo: { fullName: string } | null;
    createdBy: { fullName: string };
    assignedToId: string | null;
}

interface TasksClientProps {
    tasks: TaskWithRelations[];
    role: string;
    userId: string;
}

const priorityColors: Record<string, string> = {
    low: "bg-green-500/10 text-green-400 border border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const statusColors: Record<string, string> = {
    pending: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border border-green-500/20",
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function formatTime(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

function formatDateTime(dateStr: string) {
    return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

export default function TasksClient({ tasks, role, userId }: TasksClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"all" | "history">("all");
    const [viewTask, setViewTask] = useState<TaskWithRelations | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filter based on tab
    const displayedTasks =
        activeTab === "history"
            ? tasks.filter((t) => t.status === "completed")
            : tasks;

    // --- Delete Task ---
    async function handleDelete() {
        if (!deleteTaskId) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/tasks/${deleteTaskId}`, { method: "DELETE" });
            if (res.ok) {
                setDeleteTaskId(null);
                router.refresh();
            }
        } finally {
            setDeleteLoading(false);
        }
    }

    const completedCount = tasks.filter((t) => t.status === "completed").length;

    return (
        <>
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex gap-1 bg-brand-secondary border border-brand-border rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "all"
                                ? "bg-brand-accent text-black"
                                : "text-brand-muted hover:text-brand-text"
                            }`}
                    >
                        {role === "admin" ? "All Tasks" : "My Tasks"}
                        <span className="ml-1.5 text-xs opacity-70">({tasks.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "history"
                                ? "bg-brand-accent text-black"
                                : "text-brand-muted hover:text-brand-text"
                            }`}
                    >
                        <CheckCircle2 size={13} />
                        Completed History
                        <span className="ml-0.5 text-xs opacity-70">({completedCount})</span>
                    </button>
                </div>
            </div>

            {/* Table */}
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
                                <th className="text-right px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {displayedTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-brand-text text-sm max-w-[200px] truncate">
                                        {task.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-muted">
                                        {task.project.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${priorityColors[task.priority]}`}>
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
                                        {formatDate(task.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-muted">
                                        {task.assignedTo?.fullName ?? "Unassigned"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* View Button — visible to all */}
                                            <button
                                                onClick={() => setViewTask(task)}
                                                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 transition-colors"
                                                title="View Task Details"
                                            >
                                                <Eye size={15} />
                                            </button>

                                            {/* Delete Button — admin only */}
                                            {role === "admin" && (
                                                <button
                                                    onClick={() => setDeleteTaskId(task.id)}
                                                    className="p-1.5 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayedTasks.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-14 text-brand-muted text-sm">
                                        {activeTab === "history"
                                            ? "No completed tasks yet."
                                            : "No tasks found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ───── VIEW TASK MODAL ───── */}
            {viewTask && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setViewTask(null)}
                >
                    <div
                        className="bg-brand-secondary border border-brand-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-brand-border">
                            <div className="flex-1 pr-4">
                                <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Task Details</p>
                                <h2 className="text-lg font-bold text-brand-text leading-snug">
                                    {viewTask.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setViewTask(null)}
                                className="p-1.5 rounded-lg hover:bg-brand-border text-brand-muted transition-colors flex-shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${priorityColors[viewTask.priority]}`}>
                                    <Flag size={10} className="inline mr-1" />
                                    {viewTask.priority} Priority
                                </span>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[viewTask.status]}`}>
                                    {viewTask.status.replace("_", " ")}
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-xs text-brand-muted uppercase tracking-wider mb-2 font-medium">Description</p>
                                <p className="text-sm text-brand-text leading-relaxed bg-brand-primary rounded-xl p-4 border border-brand-border">
                                    {viewTask.description || "No description provided."}
                                </p>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-brand-primary rounded-xl p-4 border border-brand-border space-y-1">
                                    <div className="flex items-center gap-1.5 text-brand-muted">
                                        <Layers size={13} />
                                        <span className="text-xs uppercase tracking-wider font-medium">Project</span>
                                    </div>
                                    <p className="text-sm font-semibold text-brand-text">{viewTask.project.title}</p>
                                </div>
                                <div className="bg-brand-primary rounded-xl p-4 border border-brand-border space-y-1">
                                    <div className="flex items-center gap-1.5 text-brand-muted">
                                        <User size={13} />
                                        <span className="text-xs uppercase tracking-wider font-medium">Assigned To</span>
                                    </div>
                                    <p className="text-sm font-semibold text-brand-text">
                                        {viewTask.assignedTo?.fullName ?? "Unassigned"}
                                    </p>
                                </div>
                                <div className="bg-brand-primary rounded-xl p-4 border border-brand-border space-y-1">
                                    <div className="flex items-center gap-1.5 text-brand-muted">
                                        <User size={13} />
                                        <span className="text-xs uppercase tracking-wider font-medium">Created By</span>
                                    </div>
                                    <p className="text-sm font-semibold text-brand-text">{viewTask.createdBy.fullName}</p>
                                </div>
                                <div className="bg-brand-primary rounded-xl p-4 border border-brand-border space-y-1">
                                    <div className="flex items-center gap-1.5 text-brand-muted">
                                        <Calendar size={13} />
                                        <span className="text-xs uppercase tracking-wider font-medium">Due Date</span>
                                    </div>
                                    <p className="text-sm font-semibold text-brand-text">{formatDate(viewTask.dueDate)}</p>
                                </div>
                            </div>

                            {/* Created At with time */}
                            <div className="bg-brand-primary rounded-xl p-4 border border-brand-border">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-brand-muted">
                                        <Calendar size={14} />
                                        <span>{formatDate(viewTask.createdAt)}</span>
                                    </div>
                                    <div className="w-px h-4 bg-brand-border" />
                                    <div className="flex items-center gap-2 text-brand-muted">
                                        <Clock size={14} />
                                        <span>{formatTime(viewTask.createdAt)}</span>
                                    </div>
                                    <span className="text-xs text-brand-muted ml-auto">Date created</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setViewTask(null)}
                                className="w-full py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm hover:bg-brand-border transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ───── DELETE CONFIRM MODAL ───── */}
            {deleteTaskId && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => !deleteLoading && setDeleteTaskId(null)}
                >
                    <div
                        className="bg-brand-secondary border border-brand-border rounded-2xl shadow-2xl w-full max-w-sm p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-brand-text">Delete Task</h3>
                                <p className="text-sm text-brand-muted">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-brand-muted mb-6 bg-brand-primary rounded-xl p-3 border border-brand-border">
                            Are you sure you want to permanently delete this task?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTaskId(null)}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm hover:bg-brand-border transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
