import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const emp = await prisma.user.findUnique({
            where: { email: "arham.noman2004@gmail.com" },
        });

        return NextResponse.json({
            databaseUrlStart: process.env.DATABASE_URL?.substring(0, 35) || "MISSING",
            nextAuthUrl: process.env.NEXTAUTH_URL || "MISSING",
            employeeFound: !!emp,
            employeeHashSnippet: emp?.password?.substring(0, 15) || "N/A"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
