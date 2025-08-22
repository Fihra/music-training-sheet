import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function dashboard() {  
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/login");
    }
    
    return(
        <div>
            My dashboard logged in.
            <h1>Welcome {session.user?.email}</h1>
        </div>
    )
}