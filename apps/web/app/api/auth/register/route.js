import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();

        const {
            firstName,
            middleName,
            lastName,
            class: userClass,
            email,
            phone,
            password,
        } = await req.json();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return Response.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            middleName,
            lastName,
            class: userClass,
            email,
            phone,
            password: hashedPassword,
        });
        console.log("Created user:", user);

        return Response.json({
            message: "User created successfully!",
            user,
        });

    } catch (err) {
    console.error("REGISTER ERROR:", err);

    return Response.json(
        {
            error: err.message,
        },
        {
            status: 500,
        }
    );
}
}