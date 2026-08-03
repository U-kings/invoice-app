import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    return NextResponse.json({
        firstName: user.firstName,
        role: user.role,
    });
}