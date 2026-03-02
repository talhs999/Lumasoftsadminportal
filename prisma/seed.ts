import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding admin account...");

    const existingAdmin = await prisma.user.findUnique({
        where: { email: "admin@lumasofts.com" },
    });

    if (existingAdmin) {
        console.log("✅ Admin already exists. Skipping seed.");
        return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    await prisma.user.create({
        data: {
            email: "admin@lumasofts.com",
            password: hashedPassword,
            fullName: "Luma Admin",
            username: "admin",
            role: "admin",
        },
    });

    console.log("✅ Admin created:");
    console.log("   Email:    admin@lumasofts.com");
    console.log("   Password: Admin@123");
    console.log("   ⚠️  Change the password after first login!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
