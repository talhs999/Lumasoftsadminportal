import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
    await requireAuth();

    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <ClientsClient
            clients={clients.map((c) => ({
                ...c,
                createdAt: c.createdAt.toISOString(),
            }))}
        />
    );
}
