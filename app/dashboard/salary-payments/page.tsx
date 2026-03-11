"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Wallet, Loader2 } from "lucide-react";

interface Employee {
    id: string;
    fullName: string;
    email: string;
}

interface SalaryPayment {
    id: string;
    employeeId: string;
    amount: number;
    month: string;
    paidOn: string;
    note: string | null;
    employee: { fullName: string; email: string };
    createdAt: string;
}

export default function SalaryPaymentsPage() {
    const [payments, setPayments] = useState<SalaryPayment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        employeeId: "",
        amount: "",
        month: "",
        paidOn: "",
        note: "",
    });

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        const [pRes, eRes] = await Promise.all([
            fetch("/api/salary-payments"),
            fetch("/api/employees"),
        ]);
        const [p, e] = await Promise.all([pRes.json(), eRes.json()]);
        setPayments(Array.isArray(p) ? p : []);
        setEmployees(Array.isArray(e) ? e : []);
        setLoading(false);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!form.employeeId || !form.amount || !form.month || !form.paidOn) return;
        setSubmitting(true);
        const res = await fetch("/api/salary-payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const newPayment = await res.json();
            setPayments((prev) => [newPayment, ...prev]);
            setForm({ employeeId: "", amount: "", month: "", paidOn: "", note: "" });
        }
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        const res = await fetch(`/api/salary-payments/${id}`, { method: "DELETE" });
        if (res.ok) {
            setPayments((prev) => prev.filter((p) => p.id !== id));
        }
        setDeletingId(null);
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
                        <Wallet size={22} className="text-brand-accent" />
                        Salary Payments
                    </h1>
                    <p className="text-brand-muted text-sm mt-0.5">
                        Record and track salary payments for all employees
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-brand-muted">Total Paid (all records)</p>
                    <p className="text-lg font-bold text-brand-accent">
                        PKR {totalPaid.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Add Payment Form */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm p-6">
                <h2 className="text-base font-semibold text-brand-text mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-brand-accent" />
                    Add New Payment
                </h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Employee */}
                    <div className="space-y-1">
                        <label className="text-xs text-brand-muted font-medium">Employee *</label>
                        <select
                            value={form.employeeId}
                            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                            required
                            className="w-full bg-brand-primary border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                        >
                            <option value="">Select employee...</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <label className="text-xs text-brand-muted font-medium">Amount (PKR) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 50000"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            required
                            className="w-full bg-brand-primary border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2.5 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                        />
                    </div>

                    {/* Month */}
                    <div className="space-y-1">
                        <label className="text-xs text-brand-muted font-medium">Month *</label>
                        <input
                            type="text"
                            placeholder="e.g. March 2026"
                            value={form.month}
                            onChange={(e) => setForm({ ...form, month: e.target.value })}
                            required
                            className="w-full bg-brand-primary border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2.5 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                        />
                    </div>

                    {/* Date Paid */}
                    <div className="space-y-1">
                        <label className="text-xs text-brand-muted font-medium">Date Paid *</label>
                        <input
                            type="date"
                            value={form.paidOn}
                            onChange={(e) => setForm({ ...form, paidOn: e.target.value })}
                            required
                            className="w-full bg-brand-primary border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-1">
                        <label className="text-xs text-brand-muted font-medium">Note (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Advance payment"
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            className="w-full bg-brand-primary border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2.5 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            {submitting ? "Adding..." : "Add Payment"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Payments Table */}
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
                    <h2 className="text-base font-semibold text-brand-text">
                        Payment History
                    </h2>
                    <span className="text-xs text-brand-muted bg-brand-primary px-2.5 py-1 rounded-full">
                        {payments.length} records
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-brand-accent" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-16 text-brand-muted text-sm">
                        No salary payments recorded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5 text-xs text-brand-muted uppercase tracking-wider">
                                    <th className="text-left px-6 py-4">Employee</th>
                                    <th className="text-left px-6 py-4">Month</th>
                                    <th className="text-left px-6 py-4">Amount</th>
                                    <th className="text-left px-6 py-4">Date Paid</th>
                                    <th className="text-left px-6 py-4">Note</th>
                                    <th className="text-left px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {payments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-brand-text">
                                                {payment.employee.fullName}
                                            </p>
                                            <p className="text-xs text-brand-muted">
                                                {payment.employee.email}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {payment.month}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-brand-accent">
                                                PKR {payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {new Date(payment.paidOn).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {payment.note ?? "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                disabled={deletingId === payment.id}
                                                className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingId === payment.id ? (
                                                    <Loader2 size={15} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={15} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
