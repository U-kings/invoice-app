import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

// ===========================
// CREATE PAYMENT ITEM
// ===========================
export async function POST(req) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // (Optional) Check admin role here
        // if (decoded.class !== "ADMIN") {
        //     return NextResponse.json(
        //         { error: "Forbidden" },
        //         { status: 403 }
        //     );
        // }

        const body = await req.json();

        const user = await getCurrentUser();

if (!user || user.role !== "admin") {
    return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
    );
}
   

const {
    title,
    amount,
    class: itemClass,
    description,
    dueDate,
} = body;

const item = await Item.create({
    title,
    amount,
    class: itemClass,     // ✅ Correct
    description,
    dueDate,
});

        return NextResponse.json(item);
console.log(body.class);
console.log(Array.isArray(body.class));
    } catch (err) {
        console.error("POST /api/items:", err);

        return NextResponse.json(
            {
                error: err.message,
            },
            {
                status: 500,
            }
        );
    }
}

// ===========================
// GET ALL PAYMENT ITEMS
// ===========================
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

        let items;

        if (user.role === "admin") {
            // Admin sees every payment item
            items = await Item.find().sort({
                createdAt: -1,
            });
        } else {
            // Students only see their own class items
        items = await Item.find({
    class: { $in: [user.class] },
    active: true,
}).sort({
    createdAt: -1,
});
        }

        return NextResponse.json(items);

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}