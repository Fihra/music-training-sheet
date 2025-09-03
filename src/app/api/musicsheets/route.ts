import mysql from "mysql2/promise";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

interface User {
    user_id: number;
    email: string;
    musicSheets: string[]
}

export async function GET(req:  NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        console.log(session);

    }catch (error) {
        return NextResponse.json({ error: error}, {status: 500})
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        const { musicSheet, user_id, key_signature} = body;

        const connection = await db.getConnection();

        const [result] = await connection.query<ResultSetHeader>(
            "INSERT INTO musicsheets (user_id, sheet_tones, key_signature) VALUES (?, ?, ?)", [
                user_id, JSON.stringify(musicSheet), key_signature
            ]
        )

        const newMusicSheetID = result.insertId;

        const [users] = await connection.query<RowDataPacket[]>("SELECT * FROM users WHERE user_id = ?", [user_id]);

        if(users.length === 0) {
            return NextResponse.json({ error: 'invalid user'}, {status: 400})
        }

        const user = users[0] as User;

        const currentMusicSheets = Array.isArray(user.musicSheets) ? user.musicSheets : [];
        const updatedMusicSheets = [...currentMusicSheets, newMusicSheetID];

        await connection.query("UPDATE users SET musicSheets = ? WHERE user_id = ?",  [
            JSON.stringify(updatedMusicSheets),
            user_id
        ])
        await connection.commit();

        return Response.json({ message: "Music Sheet Created"});

    }catch(error:any) {
        console.error(error);
        return Response.json({
            message: "Error: " + error.message
        }, {status: 500});
    }
}