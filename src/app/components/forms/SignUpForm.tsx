'use client';

import React, { useState } from 'react';

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
        // console.log(signupForm);

        const res = await fetch("/api/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(signupForm)
        });

        console.log("Res: ", res.json());

        const data = await res.json();
        console.log(data);

    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="email" onChange={handleChange} value={signupForm.email} required/>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" onChange={handleChange} value={signupForm.password} required/>
            </div>
            <button type="submit">Submit</button>
        </form>
    )
}
    


export default SignUpForm;