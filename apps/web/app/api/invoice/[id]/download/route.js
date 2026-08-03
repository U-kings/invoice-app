import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

export async function GET(req, { params }) {
    await connectDB();

    const invoice = await Invoice.findById(params.id).populate("user");

    if (!invoice) {
        return new Response("Invoice not found", {
            status: 404,
        });
    }

    const doc = new PDFDocument();

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // ===== PDF CONTENT =====

    doc.fontSize(24).text("InvoiceFlow", {
        align: "center",
    });

    doc.moveDown();

    doc.fontSize(14);

    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);

    doc.text(
        `Student: ${invoice.user.firstName} ${invoice.user.lastName}`
    );

    doc.text(`Email: ${invoice.user.email}`);

    doc.text(`Phone: ${invoice.user.phone}`);

    doc.moveDown();

    doc.fontSize(18).text("Items");

    doc.moveDown(0.5);

    invoice.items.forEach((item) => {
        doc.text(
            `${item.title}    ₦${item.payableAmount.toLocaleString()}`
        );
    });

    doc.moveDown();

    doc.fontSize(16).text(
        `Total Paid: ₦${invoice.amount.toLocaleString()}`
    );

    doc.text(`Status: ${invoice.status}`);

    doc.text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`
    );

    doc.end();

    const pdf = await pdfPromise;

    return new Response(pdf, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`,
        },
    });
}