"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Modal from "@/components/Modal";

export default function DeleteProjectButton({ projectId, redirectUrl }: { projectId: string; redirectUrl?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    }

    async function handleDelete() {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) throw new Error(data.error || "Failed to delete");

            setShowModal(false);
            if (redirectUrl) {
                router.push(redirectUrl);
                router.refresh();
            } else {
                router.refresh();
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete project. Only admins can perform this action.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-muted hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete Project"
            >
                <Trash2 size={15} />
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => !loading && setShowModal(false)}
                title="Delete Project"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-brand-muted">
                        Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks.
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
                            onClick={() => setShowModal(false)}
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
