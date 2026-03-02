"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { Plus, Trash2 } from "lucide-react";

interface Employee {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

interface EmployeesClientProps {
    employees: Employee[];
}

export default function EmployeesClient({ employees: initial }: EmployeesClientProps) {
    const router = useRouter();
    const [employees, setEmployees] = useState(initial);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: "employee",
    });

    const set = (key: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.fullName || !form.email || !form.password || !form.username) {
            setError("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create employee");
            setEmployees((prev) => [data, ...prev]);
            setModalOpen(false);
            setForm({ fullName: "", username: "", email: "", password: "", role: "employee" });
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deletingId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/employees/${deletingId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete employee");
            setEmployees((prev) => prev.filter((e) => e.id !== deletingId));
            setDeletingId(null);
            router.refresh();
        } catch {
            alert("Failed to delete employee. Only admins can perform this action.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Employees</h1>
                        <p className="text-brand-muted text-sm">{employees.length} team members</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Add Employee
                    </button>
                </div>

                <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5 text-xs text-brand-muted uppercase tracking-wider">
                                    <th className="text-left px-6 py-4">Full Name</th>
                                    <th className="text-left px-6 py-4">Username</th>
                                    <th className="text-left px-6 py-4">Email</th>
                                    <th className="text-left px-6 py-4">Role</th>
                                    <th className="text-left px-6 py-4">Joined</th>
                                    <th className="text-left px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-brand-text text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold flex-shrink-0 ${emp.role === "admin" ? "bg-brand-accent" : "bg-blue-400"}`}>
                                                    {emp.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                {emp.fullName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">@{emp.username}</td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">{emp.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={emp.role === "admin" ? "badge-admin" : "badge-employee"}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {new Date(emp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(emp.id); }}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-muted hover:text-red-500 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {employees.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-14 text-brand-muted text-sm">
                                            No employees yet. Add your first team member.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Employee Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setError(""); }}
                title="Add New Employee"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <FormInput label="Full Name" value={form.fullName} onChange={set("fullName")} required disabled={loading} placeholder="e.g. Ahmed Khan" />
                    <FormInput label="Username" value={form.username} onChange={set("username")} required disabled={loading} placeholder="e.g. ahmed.khan" />
                    <FormInput label="Email" type="email" value={form.email} onChange={set("email")} required disabled={loading} placeholder="ahmed@lumasofts.com" />
                    <FormInput label="Temporary Password" type="password" value={form.password} onChange={set("password")} required disabled={loading} hint="Employee should change this after first login" />
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-brand-text">Role</label>
                        <select value={form.role} onChange={(e) => set("role")(e.target.value)} className="input-field" disabled={loading}>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? "Creating..." : "Create Employee"}
                        </button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Employee Modal */}
            <Modal isOpen={!!deletingId} onClose={() => !loading && setDeletingId(null)} title="Remove Employee" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-brand-muted">
                        Are you sure you want to remove this employee? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Removing..." : "Yes, Remove"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            disabled={loading}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
