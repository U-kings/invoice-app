import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
    try {
        await connectDB();

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const invoices = await Invoice.find({
            user: user._id,
        }).sort({
            createdAt: -1,
        });

        return NextResponse.json(invoices);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}