"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";

interface TaskFormClientProps {
    projects: { id: string; title: string }[];
    employees: { id: string; fullName: string }[];
    defaultProjectId?: string;
}

export default function TaskFormClient({
    projects,
    employees,
    defaultProjectId,
}: TaskFormClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        projectId: defaultProjectId ?? "",
        priority: "medium",
        assignedToId: "",
        dueDate: "",
    });

    const set = (key: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.title || !form.projectId) {
            setError("Title and Project are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    assignedToId: form.assignedToId || null,
                    dueDate: form.dueDate || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create task");
            }

            router.push("/dashboard/tasks");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <FormInput
                label="Task Title"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Design homepage mockup"
                required
                disabled={loading}
            />

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-text">Description</label>
                <textarea
                    value={form.description}
                    onChange={(e) => set("description")(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    disabled={loading}
                    placeholder="Task details..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">
                        Project <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={form.projectId}
                        onChange={(e) => set("projectId")(e.target.value)}
                        className="input-field"
                        disabled={loading}
                    >
                        <option value="">Select project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">Priority</label>
                    <select
                        value={form.priority}
                        onChange={(e) => set("priority")(e.target.value)}
                        className="input-field"
                        disabled={loading}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">Assign To</label>
                    <select
                        value={form.assignedToId}
                        onChange={(e) => set("assignedToId")(e.target.value)}
                        className="input-field"
                        disabled={loading}
                    >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                    </select>
                </div>

                <FormInput
                    label="Due Date"
                    type="date"
                    value={form.dueDate}
                    onChange={set("dueDate")}
                    disabled={loading}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating...
                        </>
                    ) : (
                        "Create Task"
                    )}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary">
                    Cancel
                </button>
            </div>
        </form>
    );
}
