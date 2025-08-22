'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <label>Password:</label>
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <button type="submit">
                Login
            </button>
        </form>
    )

}

export default Login;