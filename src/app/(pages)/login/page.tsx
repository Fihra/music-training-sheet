'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault();
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password
        });

        if(!result?.error) {
            router.push("/dashboard");
        } else {
            alert("Invalid credentials");
        }
    }

    return(
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2>Login</h2>
            <section>
                <label>Email:</label>
                <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                />
            </section>
            <section>
                <label>Password:</label>
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                />
            </section>
            <section>
                <button className={styles.cta} type="submit">
                    Login
                </button>
            </section>
        </form>
    )

}

export default Login;