import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/salary-payments/[id] — Admin only
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.salaryPayment.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete salary payment" }, { status: 500 });
    }
}
