"use client";

import Link from "next/link";
import styles from "../page.module.css";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
    const { data: session, status} = useSession();

    if(status === "loading") return <p>Loading....</p>;

    const showLogout = ()=> {
        if(!session) {
            return (
                <>
                    <Link href="/signup" className={styles.navlink}>Sign up</Link>
                    <Link href="/login" className={styles.navlink}>Login</Link>
                </>
            )
        } else {
            return (
            <>
                <Link href="/dashboard" className={styles.navlink}>Dashboard</Link>
                <Link href="/" className={styles.navlink} onClick={() => signOut({ callbackUrl: "/login"})}>Logout</Link>
            </>
            )
        }
    }

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.navlink}>Home</Link>
            <Link href="/music-generate" className={styles.navlink}>Generate</Link>
            {showLogout()}
            
        </nav>
    )
}

export default Navbar;