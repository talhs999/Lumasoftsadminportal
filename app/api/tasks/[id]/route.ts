import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockTasks } from "@/lib/mock-data";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode
        if (session.user.isTestUser) {
            const body = await request.json();
            const mock = mockTasks.find((t) => t.id === params.id) ?? mockTasks[0];
            return NextResponse.json({ ...mock, ...body, _testMode: true });
        }

        const userId = session.user.id;
        const role = session.user.role;

        const task = await prisma.task.findUnique({ where: { id: params.id } });
        if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Employees can only update status of their own assigned tasks
        if (role === "employee") {
            if (task.assignedToId !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            const body = await request.json();

            // Employee soft-deleting from history
            if (body.isDeletedByEmployee !== undefined) {
                const updated = await prisma.task.update({
                    where: { id: params.id },
                    data: { isDeletedByEmployee: body.isDeletedByEmployee },
                });
                return NextResponse.json(updated);
            }

            const updated = await prisma.task.update({
                where: { id: params.id },
                data: { status: body.status },
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

// Admin DELETE = soft delete (isDeletedByAdmin = true)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode
        if (session.user.isTestUser) {
            return NextResponse.json({ success: true, _testMode: true });
        }

        const role = session.user.role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Soft delete — keep in employee history
        const updated = await prisma.task.update({
            where: { id: params.id },
            data: { isDeletedByAdmin: true },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
