import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockProjects } from "@/lib/mock-data";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;
        const role = session.user.role;

        // Test Mode: return mock data
        if (session.user.isTestUser) {
            const filtered = role === "admin"
                ? mockProjects
                : mockProjects.filter(p =>
                    p.tasks.some((t: any) => t.assignedToId === userId) || p.createdById === userId
                );
            return NextResponse.json(filtered);
        }

        const projects = await prisma.project.findMany({
            where:
                role === "admin"
                    ? undefined
                    : {
                        OR: [
                            { createdById: userId },
                            { tasks: { some: { assignedToId: userId } } },
                        ],
                    },
            include: { client: true, createdBy: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(projects);
    } catch {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAuth();
        const session = await getServerSession(authOptions);

        // Test Mode: simulate success without writing to DB
        if (session?.user.isTestUser) {
            const body = await request.json();
            return NextResponse.json(
                { id: "mock-new-proj", ...body, status: "pending", createdAt: new Date().toISOString(), _testMode: true },
                { status: 201 }
            );
        }

        const userId = session!.user.id;
        const body = await request.json();
        const { title, description, clientId, budget, deadline, status } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                title,
                description: description || null,
                clientId: clientId || null,
                budget: budget ? parseFloat(budget) : null,
                deadline: deadline ? new Date(deadline) : null,
                status: status || "pending",
                createdById: userId,
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
