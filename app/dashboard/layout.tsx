import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <AuthProvider session={session}>
            <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </AuthProvider>
    );
}
