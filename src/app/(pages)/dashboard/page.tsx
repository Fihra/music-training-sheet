import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NoteSequence from "@/app/components/NoteSequence";

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
        return rows.map((musicSheet, key) => {
            return <NoteSequence key={key} sheet_tones={musicSheet.sheet_tones}/>
        })
    }
    
    return(
        <div>
            My dashboard logged in.
            <h1>Welcome {session.user?.email}</h1>
            {/* <p>{JSON.stringify(rows, null, 2)}</p> */}
            {showSequences()}
        </div>
    )
}