import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Item from "@/models/Item";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        const invoice = await Invoice.findById(id).populate(
            "user",
            "firstName lastName email phone class"
        );

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        // Get every payment item assigned to the student's class
        const allItems = await Item.find({
            class: invoice.user.class,
            active: true,
        });

        // Merge assigned items with paid items
        const mergedItems = allItems.map((item) => {
            const paidItem = invoice.items.find(
                (i: any) => i.title === item.title
            );

            const paidAmount = paidItem
                ? paidItem.payableAmount
                : 0;

            const outstanding =
                item.amount - paidAmount;

            let status = "UNPAID";

            if (paidAmount >= item.amount) {
                status = "PAID";
            } else if (paidAmount > 0) {
                status = "PARTIAL";
            }

            return {
                title: item.title,
                amount: item.amount,
                payableAmount: paidAmount,
                outstanding,
                installmentPercent:
                    paidItem?.installmentPercent ?? 0,
                status,
            };
        });

        const totalAmount = mergedItems.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const totalPaid = mergedItems.reduce(
            (sum, item) => sum + item.payableAmount,
            0
        );

        const totalOutstanding =
            totalAmount - totalPaid;

        return NextResponse.json({
            ...invoice.toObject(),
            items: mergedItems,
            totalAmount,
            totalPaid,
            totalOutstanding,
        });

    } catch (err: any) {
        console.error(err);

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}