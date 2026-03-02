import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, contactInfo } = await request.json();
        const client = await prisma.client.update({
            where: { id: params.id },
            data: { name, contactInfo: contactInfo || null },
        });

        return NextResponse.json(client);
    } catch {
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any).role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.client.delete({ where: { id: params.id } });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/clients");
        revalidatePath("/dashboard/projects");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
