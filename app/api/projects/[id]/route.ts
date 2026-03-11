import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { mockProjects } from "@/lib/mock-data";

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (session.user.isTestUser) {
            const project = mockProjects.find((p) => p.id === params.id) ?? mockProjects[0];
            return NextResponse.json(project);
        }

        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: { client: true, createdBy: true, tasks: { include: { assignedTo: true } } },
        });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Hide budget from non-admin users
        const role = session.user.role;
        const safeProject = role === "admin"
            ? project
            : { ...project, budget: undefined };

        return NextResponse.json(safeProject);
    } catch {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode: simulate update without hitting DB
        if (session.user.isTestUser) {
            const body = await request.json();
            const mock = mockProjects.find((p) => p.id === params.id) ?? mockProjects[0];
            return NextResponse.json({ ...mock, ...body, _testMode: true });
        }

        const userId = session.user.id;
        const role = session.user.role;

        const project = await prisma.project.findUnique({ where: { id: params.id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (role !== "admin" && project.createdById !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, clientId, budget, deadline, status } = body;

        const updated = await prisma.project.update({
            where: { id: params.id },
            data: {
                title,
                description: description || null,
                clientId: clientId || null,
                budget: budget ? parseFloat(budget) : null,
                deadline: deadline ? new Date(deadline) : null,
                status,
            },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode: simulate delete without hitting DB
        if (session.user.isTestUser) {
            return NextResponse.json({ success: true, _testMode: true });
        }

        const role = session.user.role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.project.delete({ where: { id: params.id } });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/projects");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
