import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockEmployees } from "@/lib/mock-data";

// GET /api/employees - Return all employees (admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode
        if (session.user.isTestUser) return NextResponse.json(mockEmployees);

        await requireAdmin();
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// POST /api/employees - Admin creates a new employee
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Test Mode
        if (session.user.isTestUser) {
            const body = await request.json();
            return NextResponse.json({ id: "mock-new-emp", ...body, role: body.role || "employee", createdAt: new Date().toISOString(), _testMode: true }, { status: 201 });
        }

        await requireAdmin();
        const body = await request.json();
        const { email, password, fullName, username, role } = body;

        if (!email || !password || !fullName || !username) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                username,
                role: role || "employee",
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "Email or username already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
    }
}
