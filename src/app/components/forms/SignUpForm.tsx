const SignUpForm = () => {
    return (
        <form>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="email"/>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password"/>
            </div>
            <button type="submit">Submit</button>
        </form>
    )
}
    


export default SignUpForm;