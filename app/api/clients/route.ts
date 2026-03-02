import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json(clients);
    } catch {
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, contactInfo } = await request.json();
        if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

        const client = await prisma.client.create({
            data: { name, contactInfo: contactInfo || null },
        });

        return NextResponse.json(client, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
