"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";

interface ProjectFormProps {
    clients: { id: string; name: string }[];
    userId: string;
}

export default function CreateProjectClient({ clients, userId }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        clientId: "",
        budget: "",
        deadline: "",
        status: "pending",
    });

    const set = (key: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.title || !form.description) {
            setError("Title and description are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
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
                throw new Error(data.error || "Failed to create project");
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

            <FormInput
                label="Project Title"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. E-Commerce Website"
                required
                disabled={loading}
            />

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-brand-text">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => set("description")(e.target.value)}
                    placeholder="Project description..."
                    rows={3}
                    disabled={loading}
                    className="input-field resize-none"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">
                        Client
                    </label>
                    <select
                        value={form.clientId}
                        onChange={(e) => set("clientId")(e.target.value)}
                        disabled={loading}
                        className="input-field"
                    >
                        <option value="">No client</option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-text">
                        Status
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => set("status")(e.target.value)}
                        disabled={loading}
                        className="input-field"
                    >
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <FormInput
                    label="Budget ($)"
                    type="number"
                    value={form.budget}
                    onChange={set("budget")}
                    placeholder="e.g. 5000"
                    disabled={loading}
                    hint="Leave blank if not set"
                />

                <FormInput
                    label="Deadline"
                    type="date"
                    value={form.deadline}
                    onChange={set("deadline")}
                    disabled={loading}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating...
                        </>
                    ) : (
                        "Create Project"
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
