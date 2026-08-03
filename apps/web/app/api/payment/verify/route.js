import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";

export async function POST(req) {
    try {
        await connectDB();

        const { reference } = await req.json();

        if (!reference) {
            return NextResponse.json(
                { error: "Payment reference is required" },
                { status: 400 }
            );
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ==========================================
        // VERIFY TRANSACTION WITH PAYSTACK
        // ==========================================

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error("PAYSTACK VERIFY ERROR:", data);

            return NextResponse.json(
                {
                    error:
                        data.message ||
                        "Unable to verify payment",
                },
                { status: 400 }
            );
        }

        const transaction = data.data;

        // ==========================================
        // MAKE SURE PAYMENT WAS SUCCESSFUL
        // ==========================================

        if (transaction.status !== "success") {
            return NextResponse.json(
                {
                    error: "Payment was not successful",
                    status: transaction.status,
                },
                { status: 400 }
            );
        }

        // ==========================================
        // PREVENT DUPLICATE PAYMENT
        // ==========================================

        const existingPayment = await Payment.findOne({
            reference,
        });

        if (existingPayment) {
            return NextResponse.json({
                message: "Payment already verified",
                payment: existingPayment,
            });
        }

        // ==========================================
        // GET BREAKDOWN FROM PAYSTACK METADATA
        // ==========================================

        const breakdown =
            transaction.metadata?.items || [];

        const method =
            transaction.metadata?.method || "card";

        if (!breakdown.length) {
            return NextResponse.json(
                {
                    error:
                        "No payment items found in transaction metadata",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // PREPARE ITEMS
        // ==========================================

        const paymentItems = breakdown.map((item) => {
            const amount = Number(item.amount || 0);

            const payableAmount = Number(
                item.payableAmount || 0
            );

            const outstandingAmount = Math.max(
                amount - payableAmount,
                0
            );

            let status = "UNPAID";

            if (payableAmount >= amount) {
                status = "PAID";
            } else if (payableAmount > 0) {
                status = "PARTIAL";
            }

            return {
                title: item.title,
                amount,
                payableAmount,
                outstandingAmount,
                installmentPercent:
                    Number(item.installmentPercent || 0),
                status,
            };
        });

        // ==========================================
        // CALCULATE TOTALS
        // ==========================================

        const totalAmount = paymentItems.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const totalPaid = paymentItems.reduce(
            (sum, item) =>
                sum + item.payableAmount,
            0
        );

        const totalOutstanding = paymentItems.reduce(
            (sum, item) =>
                sum + item.outstandingAmount,
            0
        );

        let invoiceStatus = "UNPAID";

        if (
            totalAmount > 0 &&
            totalOutstanding <= 0
        ) {
            invoiceStatus = "PAID";
        } else if (totalPaid > 0) {
            invoiceStatus = "PARTIAL";
        }

        // ==========================================
        // CREATE PAYMENT
        // ==========================================

        const payment = await Payment.create({
            user: user._id,
            reference,
            amount: transaction.amount / 100,
            method,
            items: paymentItems,
            status: "SUCCESS",
            paidAt: new Date(),
        });

        // ==========================================
        // CREATE INVOICE
        // ==========================================

        const invoice = await Invoice.create({
            user: user._id,
            payment: payment._id,

            invoiceNumber: `INV-${Date.now()}`,

            totalAmount,
            totalPaid,
            totalOutstanding,

            items: paymentItems,

            status: invoiceStatus,
        });

        return NextResponse.json({
            message: "Payment verified successfully",
            payment,
            invoice,
        });

    } catch (error) {
        console.error(
            "PAYMENT VERIFY ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Unable to verify payment",
            },
            { status: 500 }
        );
    }
}