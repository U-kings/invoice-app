import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";

export async function GET() {

    await connectDB();

    const totalUsers = await User.countDocuments();

    const totalPayments = await Payment.countDocuments();

    const totalInvoices = await Invoice.countDocuments();

    const payments = await Payment.find();

    const totalRevenue = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
    );

    return NextResponse.json({

        totalUsers,

        totalPayments,

        totalInvoices,

        totalRevenue,

    });

}