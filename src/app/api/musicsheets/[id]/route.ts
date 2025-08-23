import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import mysql2 from 'mysql2'

export async function DELETE(req: NextRequest, {params }: {params: {id: number}}){
    const { id } = await params;

    console.log("my id: ", id);

    try{
        const [deleteResult] = await db.query<mysql2.ResultSetHeader>('DELETE FROM musicsheets WHERE music_sheet_id = ?', [id]);

        if(deleteResult.affectedRows === 0){
            return new Response("Music sheet not found", { status: 400})
        }
        return new Response('Music sheet deleted Successfully', { status: 200});
    } catch(error) {
        console.error("Error deleting music: ", error);
        return new Response("Failed to delete music sheet", { status: 500})
    }

}