import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET() {
    try {
        await connectDB();

        const payments = await Payment.find()
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 });

        return NextResponse.json(payments);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}