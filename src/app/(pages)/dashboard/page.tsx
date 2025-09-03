'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NoteSequence from "@/app/components/NoteSequence";
import styles from "../../page.module.css";
import { RowDataPacket } from "mysql2";

export default async function dashboard() {  
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/login");
    }

    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM musicSheets WHERE user_id = ?",
        [session.user.user_id]
    );

    const showSequences = () => {
        return rows.map((musicSheet) => {
                return <NoteSequence key={musicSheet.music_sheet_id} sheet_tones={musicSheet.sheet_tones} musicSheetID={musicSheet.music_sheet_id} keySig={musicSheet.key_signature}/>
        })
    }
    
    return(
        <div className={styles.dashboardContainer}>
            <h1>Welcome back!</h1>
            <p>Email: {session.user?.email}</p>
            {showSequences()}
        </div>
    )
}