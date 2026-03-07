import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import ClientsClient from "./ClientsClient";
import { mockClients } from "@/lib/mock-data";

export default async function ClientsPage() {
    const session = await getServerSession(authOptions);
    const isTestUser = session?.user?.isTestUser ?? false;

    if (isTestUser) {
        return <ClientsClient clients={mockClients as any} />;
    }

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
