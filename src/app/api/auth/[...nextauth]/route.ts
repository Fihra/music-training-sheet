import NextAuth, { NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { RowDataPacket } from "mysql2";
// import mysql from "mysql2/promise";
import { db } from "@/lib/db";

interface User {
    user_id: number;
    email: string;
    password: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: { label: "Password", type: "password" },
            },
        async authorize(credentials:Record<"email" | "password", string> | undefined): Promise<any> {
            if(!credentials?.email || !credentials?.password) {
                return null;
            }

        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
        );

        const users = rows as User[];
        if(users.length === 0) return null;

        const user = users[0];

        const isValid = await compare(credentials.password, user.password);
        if(!isValid) return null;

        return { user_id: user.user_id, email: user.email };
            },
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }){
            if(user) {
                token.user_id = (user as any).user_id;
            }
            return token;
        },
        async session({ session, token }) {
            if(token) {
                (session.user as any).user_id = token.user_id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };