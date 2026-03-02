import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const task = await prisma.task.findUnique({ where: { id: params.id } });
        if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Employees can only update status of their own assigned tasks
        if (role === "employee") {
            if (task.assignedToId !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            const { status } = await request.json();
            const updated = await prisma.task.update({
                where: { id: params.id },
                data: { status },
            });
            return NextResponse.json(updated);
        }

        // Admin can update anything
        const body = await request.json();
        const updated = await prisma.task.update({
            where: { id: params.id },
            data: {
                ...body,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
            },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any).role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.task.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
