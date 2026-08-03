import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
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

        const payments = await Payment.find({
            user: user._id,
        }).sort({ createdAt: -1 });

        // Total amount actually paid
        const totalPaid = payments.reduce(
            (total, payment) =>
                total +
                payment.items.reduce(
                    (sum, item) => sum + (item.payableAmount || 0),
                    0
                ),
            0
        );

        // Total amount still outstanding
        const totalOutstanding = payments.reduce(
            (total, payment) =>
                total +
                payment.items.reduce(
                    (sum, item) =>
                        sum + (item.outstandingAmount || 0),
                    0
                ),
            0
        );

        // Fully paid items
        const paidItems = payments.reduce(
            (total, payment) =>
                total +
                payment.items.filter(
                    (item) => item.status === "PAID"
                ).length,
            0
        );

        // Partially paid + unpaid items
        const pendingItems = payments.reduce(
            (total, payment) =>
                total +
                payment.items.filter(
                    (item) =>
                        item.status === "PARTIAL" ||
                        item.status === "UNPAID"
                ).length,
            0
        );

        const recentPayments = payments.slice(0, 5);

        return NextResponse.json({
            user,
            payments,
            recentPayments,
            totalPaid,
            totalOutstanding,
            paidItems,
            pendingItems,
        });

    } catch (error) {
        console.error("GET /api/payments ERROR:", error);

        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}