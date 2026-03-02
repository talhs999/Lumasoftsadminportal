import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const project = await prisma.project.findUnique({ where: { id: params.id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Role check
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

        const role = (session.user as any).role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.project.delete({ where: { id: params.id } });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/projects");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
