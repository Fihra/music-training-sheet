import Link from "next/link";

const Navbar = () => {
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/music-generate">Generate</Link>
            <Link href="/signup">Sign up</Link>
        </nav>
    )
}

export default Navbar;