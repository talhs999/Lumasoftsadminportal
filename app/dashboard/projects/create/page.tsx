import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/ProjectForm";

export default async function CreateProjectPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const clients = await prisma.client.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-brand-text">Create New Project</h1>
                <p className="text-brand-muted text-sm">Fill in the details below</p>
            </div>
            <div className="bg-brand-secondary rounded-xl border border-brand-border shadow-sm p-6">
                <ProjectForm clients={clients} userId={userId} />
            </div>
        </div>
    );
}
