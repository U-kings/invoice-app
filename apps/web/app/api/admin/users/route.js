import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    await connectDB();

    const user = await getCurrentUser();

if (!user || user.role !== "admin") {
    return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
    );
}

    const users = await User.find().sort({
        createdAt: -1,
    });

    return NextResponse.json(users);
}