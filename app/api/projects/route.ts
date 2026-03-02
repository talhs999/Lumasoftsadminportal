import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

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
        const userId = (session!.user as any).id;

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
