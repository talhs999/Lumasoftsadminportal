import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
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
