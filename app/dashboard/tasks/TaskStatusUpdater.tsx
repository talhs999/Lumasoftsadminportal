"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskStatusUpdaterProps {
    taskId: string;
    currentStatus: string;
    canEdit: boolean;
}

export default function TaskStatusUpdater({
    taskId,
    currentStatus,
    canEdit,
}: TaskStatusUpdaterProps) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    async function updateStatus(newStatus: string) {
        if (!canEdit || newStatus === status) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            }
        } finally {
            setLoading(false);
        }
    }

    if (!canEdit) {
        return (
            <span className={`status-${status.replace("_", "-")} capitalize`}>
                {status.replace("_", " ")}
            </span>
        );
    }

    return (
        <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={loading}
            className="text-xs border border-brand-border rounded-lg px-2 py-1 bg-brand-primary text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer disabled:opacity-50"
        >
            <option value="pending" className="bg-brand-primary text-brand-text">Pending</option>
            <option value="in_progress" className="bg-brand-primary text-brand-text">In Progress</option>
            <option value="completed" className="bg-brand-primary text-brand-text">Completed</option>
        </select>
    );
}
