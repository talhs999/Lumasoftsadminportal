import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockTasks } from "@/lib/mock-data";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;
        const role = session.user.role;

        // Test Mode
        if (session.user.isTestUser) {
            const filtered = role === "admin"
                ? mockTasks
                : mockTasks.filter(t => t.assignedToId === userId || t.assignedToId === "test-employee-id-001");
            return NextResponse.json(filtered);
        }

        const tasks = await prisma.task.findMany({
            where:
                role === "admin"
                    ? { isDeletedByAdmin: false }
                    : {
                        assignedToId: userId,
                        isDeletedByEmployee: false,
                    },
            include: {
                project: { select: { title: true } },
                assignedTo: { select: { fullName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(tasks);
    } catch {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = session.user.role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Test Mode
        if (session.user.isTestUser) {
            const body = await request.json();
            return NextResponse.json({ id: "mock-new-task", ...body, status: "pending", createdAt: new Date().toISOString(), _testMode: true }, { status: 201 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { title, description, projectId, priority, assignedToId, dueDate } = body;

        if (!title || !projectId) {
            return NextResponse.json({ error: "Title and project are required" }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                projectId,
                priority: priority || "medium",
                assignedToId: assignedToId || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: userId,
            },
        });

        // Send notification to assigned employee
        if (assignedToId) {
            await prisma.notification.create({
                data: {
                    userId: assignedToId,
                    title: "New Task Assigned",
                    message: `You have been assigned a new task: "${title}"`,
                },
            });
        }

        return NextResponse.json(task, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
