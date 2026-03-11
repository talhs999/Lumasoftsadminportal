import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/salary-payments — Admin only
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const payments = await prisma.salaryPayment.findMany({
            include: {
                employee: { select: { fullName: true, email: true } },
            },
            orderBy: { paidOn: "desc" },
        });

        return NextResponse.json(payments);
    } catch {
        return NextResponse.json({ error: "Failed to fetch salary payments" }, { status: 500 });
    }
}

// POST /api/salary-payments — Admin only
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await request.json();
        const { employeeId, amount, month, paidOn, note } = body;

        if (!employeeId || !amount || !month || !paidOn) {
            return NextResponse.json({ error: "Employee, amount, month and date are required" }, { status: 400 });
        }

        const payment = await prisma.salaryPayment.create({
            data: {
                employeeId,
                amount: parseFloat(amount),
                month,
                paidOn: new Date(paidOn),
                note: note || null,
            },
            include: {
                employee: { select: { fullName: true, email: true } },
            },
        });

        // Notify the employee about their salary payment
        const paidDate = new Date(paidOn).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        await prisma.notification.create({
            data: {
                userId: employeeId,
                title: "Salary Payment Received",
                message: `Your salary of PKR ${parseFloat(amount).toLocaleString()} for ${month} has been paid on ${paidDate}.${note ? ` Note: ${note}` : ""}`,
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create salary payment" }, { status: 500 });
    }
}
