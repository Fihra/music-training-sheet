'use client';

import React, { useState } from 'react';
import styles from "../../page.module.css";

interface FormData {
    email: string;
    password: string;
}

const SignUpForm = () => {
    const [signupForm, setSignupForm] = useState<FormData>({ email: "", password: "" });


    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setSignupForm({
            ...signupForm,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(signupForm)
        });


        const data = await res.json();
        console.log(data);

    }

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2>Sign Up</h2>
            <section>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="email" onChange={handleChange} value={signupForm.email} required/>
            </section>
            <section>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" onChange={handleChange} value={signupForm.password} required/>
            </section>
            <section>
                <button className={styles.cta} type="submit">Submit</button>
            </section>
        </form>
    )
}
    


export default SignUpForm;