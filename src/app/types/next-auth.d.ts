import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            user_id: number;
            email: string;
            image?: string | null;
        };
    }

    interface User {
        user_id: number;
        email: string;
        image?: string | null;
    }
}