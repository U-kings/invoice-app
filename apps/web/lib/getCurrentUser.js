import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return await User.findById(decoded.userId);
}