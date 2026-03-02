"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Clock } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch {
            // silent fail
        }
    }

    // Poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function markAllRead() {
        if (unreadCount === 0) return;
        setLoading(true);
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } finally {
            setLoading(false);
        }
    }

    async function markOneRead(id: string) {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="p-2 rounded-lg hover:bg-brand-border text-brand-muted transition-colors relative"
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-brand-secondary border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-brand-text">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    disabled={loading}
                                    className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 transition-colors"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-border transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-brand-muted">
                                <Bell size={28} className="mb-2 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.read && markOneRead(n.id)}
                                    className={`w-full text-left px-4 py-3 border-b border-brand-border/50 hover:bg-white/5 transition-colors flex gap-3 ${!n.read ? "bg-brand-accent/5" : ""
                                        }`}
                                >
                                    {/* Unread dot */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-0.5 ${n.read ? "bg-transparent" : "bg-brand-accent"
                                                }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-snug ${n.read ? "text-brand-muted" : "text-brand-text"}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-brand-muted">
                                            <Clock size={10} />
                                            <span className="text-[10px]">{timeAgo(n.createdAt)}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
