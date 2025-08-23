'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NoteSequence from "@/app/components/NoteSequence";
import styles from "../../page.module.css";

export default async function dashboard() {  
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/login");
    }

    const [rows] = await db.query(
        "SELECT * FROM musicSheets WHERE user_id = ?",
        [session.user.user_id]
    );

    const showSequences = () => {
        return rows.map((musicSheet) => {
            return <NoteSequence key={musicSheet.music_sheet_id} sheet_tones={musicSheet.sheet_tones} musicSheetID={musicSheet.music_sheet_id}/>
        })
    }
    
    return(
        <div className={styles.dashboardContainer}>
            <h1>Welcome back!</h1>
            <p>Email: {session.user?.email}</p>
            {/* <p>{JSON.stringify(rows, null, 2)}</p> */}
            {showSequences()}
        </div>
    )
}