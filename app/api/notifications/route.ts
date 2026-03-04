import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockNotifications } from "@/lib/mock-data";

// GET /api/notifications — returns current user's notifications (newest first)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;

        // Test Mode
        if (session.user.isTestUser) {
            return NextResponse.json(mockNotifications);
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        return NextResponse.json(notifications);
    } catch {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// PATCH /api/notifications — mark all as read, or a single one by id
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;
        const body = await request.json();

        // Test Mode
        if (session.user.isTestUser) return NextResponse.json({ success: true, _testMode: true });

        if (body.markAllRead) {
            await prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true },
            });
        } else if (body.id) {
            await prisma.notification.update({
                where: { id: body.id, userId },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
