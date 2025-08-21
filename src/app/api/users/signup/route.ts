import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;


        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await connection.execute(
            "INSERT INTO users (email, password) VALUES(?, ?)", [email, hashedPassword]
        );

        await connection.end();

        return Response.json({ message: "User registered sucessfully"});

    } catch(error:any) {
        console.error(error);
        return Response.json({
            message: "Error: " + error.message
        }, {status: 500});
    }
}