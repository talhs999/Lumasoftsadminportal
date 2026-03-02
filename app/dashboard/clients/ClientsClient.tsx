"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { Plus, Trash2, Edit } from "lucide-react";

interface Client {
    id: string;
    name: string;
    contactInfo: string | null;
    createdAt: string;
}

export default function ClientsClient({ clients: initial }: { clients: Client[] }) {
    const router = useRouter();
    const [clients, setClients] = useState(initial);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", contactInfo: "" });

    const set = (key: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    function openCreate() {
        setEditing(null);
        setForm({ name: "", contactInfo: "" });
        setError("");
        setModalOpen(true);
    }

    function openEdit(client: Client) {
        setEditing(client);
        setForm({ name: client.name, contactInfo: client.contactInfo ?? "" });
        setError("");
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name) { setError("Client name is required."); return; }
        setLoading(true);
        try {
            if (editing) {
                const res = await fetch(`/api/clients/${editing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setClients((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
            } else {
                const res = await fetch("/api/clients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setClients((prev) => [data, ...prev]);
            }
            setModalOpen(false);
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
            const res = await fetch(`/api/clients/${deletingId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete client");
            setClients((prev) => prev.filter((c) => c.id !== deletingId));
            setDeletingId(null);
            router.refresh();
        } catch {
            alert("Failed to delete client. Only admins can perform this action.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Clients</h1>
                        <p className="text-brand-muted text-sm">{clients.length} clients</p>
                    </div>
                    <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
                        <Plus size={16} />
                        Add Client
                    </button>
                </div>

                <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5 text-xs text-brand-muted uppercase tracking-wider">
                                    <th className="text-left px-6 py-4">Client Name</th>
                                    <th className="text-left px-6 py-4">Contact Info</th>
                                    <th className="text-left px-6 py-4">Added</th>
                                    <th className="text-left px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-brand-text text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                {client.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">{client.contactInfo ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {new Date(client.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent transition-colors">
                                                    <Edit size={15} />
                                                </button>
                                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(client.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-muted hover:text-red-500 transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-14 text-brand-muted text-sm">
                                            No clients yet. Add your first client.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Client" : "Add New Client"} size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">{error}</div>}
                    <FormInput label="Client Name" value={form.name} onChange={set("name")} required disabled={loading} placeholder="e.g. TechCorp Inc." />
                    <FormInput label="Contact Info" value={form.contactInfo} onChange={set("contactInfo")} disabled={loading} placeholder="Email, phone, or website" />
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? "Saving..." : editing ? "Save Changes" : "Add Client"}
                        </button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deletingId} onClose={() => !loading && setDeletingId(null)} title="Delete Client" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-brand-muted">
                        Are you sure you want to delete this client? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Deleting..." : "Yes, Delete"}
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
