import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            username: string;
            isTestUser: boolean;
        };
    }

    interface User {
        id: string;
        role: string;
        username: string;
        isTestUser: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        username: string;
        isTestUser: boolean;
    }
}
