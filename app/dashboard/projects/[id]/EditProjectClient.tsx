"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";

interface EditProjectClientProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        budget: number | null;
        deadline: Date | null;
        clientId: string | null;
    };
    clients: { id: string; name: string }[];
}

export default function EditProjectClient({ project, clients }: EditProjectClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: project.title,
        description: project.description ?? "",
        clientId: project.clientId ?? "",
        budget: project.budget?.toString() ?? "",
        deadline: project.deadline
            ? new Date(project.deadline).toISOString().split("T")[0]
            : "",
        status: project.status,
    });

    const set = (key: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    budget: form.budget ? parseFloat(form.budget) : null,
                    deadline: form.deadline || null,
                    clientId: form.clientId || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update project");
            }

            router.push("/dashboard/projects");
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
            <FormInput label="Title" value={form.title} onChange={set("title")} required disabled={loading} />
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-text">Description</label>
                <textarea value={form.description} onChange={(e) => set("description")(e.target.value)}
                    rows={3} className="input-field resize-none" disabled={loading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">Client</label>
                    <select value={form.clientId} onChange={(e) => set("clientId")(e.target.value)} className="input-field" disabled={loading}>
                        <option value="">No client</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">Status</label>
                    <select value={form.status} onChange={(e) => set("status")(e.target.value)} className="input-field" disabled={loading}>
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <FormInput label="Budget (PKR)" type="number" value={form.budget} onChange={set("budget")} disabled={loading} />
                <FormInput label="Deadline" type="date" value={form.deadline} onChange={set("deadline")} disabled={loading} />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            </div>
        </form>
    );
}
