import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import EmployeesClient from "./EmployeesClient";
import { mockEmployees } from "@/lib/mock-data";

export default async function EmployeesPage() {
    const session = await getServerSession(authOptions);
    const isTestUser = session?.user?.isTestUser ?? false;

    if (isTestUser) {
        return <EmployeesClient employees={mockEmployees as any} />;
    }

    await requireAdmin();

    const employees = await prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <EmployeesClient
            employees={employees.map((e) => ({
                ...e,
                createdAt: e.createdAt.toISOString(),
            }))}
        />
    );
}
