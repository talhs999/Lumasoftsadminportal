import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any).role;
        if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.user.delete({ where: { id: params.id } });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/employees");
        revalidatePath("/dashboard/projects");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
    }
}
