import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Invoice from "@/models/Invoice"
import Item from "@/models/Item"
import mongoose from "mongoose"

// Define strict interfaces for clean compilation
interface InvoiceItem {
  title: string
  payableAmount: number
  installmentPercent?: number
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    // Optional: Validate if it's a 24-character hex string first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Invoice ID format" },
        { status: 400 }
      )
    }

    // Populate specifically required user fields to prevent data leaks
    //@ts-expect-error Type mismatch between Invoice.user and User model
    const invoice = await Invoice.findById(id).populate(
        "user",
        "firstName lastName email phone class"
    );

    // Fetch active payment items mapped to the student's class
    const allItems = await Item.find({
      //@ts-expect-error type mismatch between invoice.user.class and Item.class
      class: invoice.user.class,
      active: true,
    })

    // Map and reconcile database items against payments
    const mergedItems = allItems.map((item) => {
      const paidItem = invoice.items.find(
        (i: InvoiceItem) => i.title === item.title
      )

      const paidAmount = paidItem ? paidItem.payableAmount : 0

      // Fix: Standardize math calculations to 2 decimal places
      const outstanding = Number((item.amount - paidAmount).toFixed(2))

      let status = "UNPAID"
      if (paidAmount >= item.amount) {
        status = "PAID"
      } else if (paidAmount > 0) {
        status = "PARTIAL"
      }

      return {
        title: item.title,
        amount: item.amount,
        payableAmount: paidAmount,
        outstanding,
        installmentPercent: paidItem?.installmentPercent ?? 0,
        status,
      }
    })

    // Compute summaries using fixed decimal strings to eliminate float bugs
    const totalAmount = Number(
      mergedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
    )

    const totalPaid = Number(
      mergedItems.reduce((sum, item) => sum + item.payableAmount, 0).toFixed(2)
    )

    const totalOutstanding = Number((totalAmount - totalPaid).toFixed(2))

    // Create an explicit response object to block database metadata leaks
    const invoiceData = invoice.toObject()

    return NextResponse.json({
      _id: invoiceData._id,
      user: invoiceData.user,
      createdAt: invoiceData.createdAt,
      updatedAt: invoiceData.updatedAt,
      items: mergedItems,
      totalAmount,
      totalPaid,
      totalOutstanding,
    })
  } catch (err: any) {
    console.error("API Error in invoice fetch:", err)

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}

// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Invoice from "@/models/Invoice";
// import Item from "@/models/Item";

// export async function GET(
//     req: Request,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         await connectDB();

//         const { id } = await params;

//         const invoice = await Invoice.findById(id).populate(
//             "user",
//             "firstName lastName email phone class"
//         );

//         if (!invoice) {
//             return NextResponse.json(
//                 { error: "Invoice not found" },
//                 { status: 404 }
//             );
//         }

//         // Get every payment item assigned to the student's class
//         const allItems = await Item.find({
//             class: invoice.user.class,
//             active: true,
//         });

//         // Merge assigned items with paid items
//         const mergedItems = allItems.map((item) => {
//             const paidItem = invoice.items.find(
//                 (i: any) => i.title === item.title
//             );

//             const paidAmount = paidItem
//                 ? paidItem.payableAmount
//                 : 0;

//             const outstanding =
//                 item.amount - paidAmount;

//             let status = "UNPAID";

//             if (paidAmount >= item.amount) {
//                 status = "PAID";
//             } else if (paidAmount > 0) {
//                 status = "PARTIAL";
//             }

//             return {
//                 title: item.title,
//                 amount: item.amount,
//                 payableAmount: paidAmount,
//                 outstanding,
//                 installmentPercent:
//                     paidItem?.installmentPercent ?? 0,
//                 status,
//             };
//         });

//         const totalAmount = mergedItems.reduce(
//             (sum, item) => sum + item.amount,
//             0
//         );

//         const totalPaid = mergedItems.reduce(
//             (sum, item) => sum + item.payableAmount,
//             0
//         );

//         const totalOutstanding =
//             totalAmount - totalPaid;

//         return NextResponse.json({
//             ...invoice.toObject(),
//             items: mergedItems,
//             totalAmount,
//             totalPaid,
//             totalOutstanding,
//         });

//     } catch (err: any) {
//         console.error(err);

//         return NextResponse.json(
//             { error: err.message },
//             { status: 500 }
//         );
//     }
// }
