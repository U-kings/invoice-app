import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        middleName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        class: {
            type: String,
            required: true, // e.g. "SS1", "JSS3", "Final Year", or business tier
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        phone: {
            type: String,
        }
    },
    { timestamps: true }
);

export default mongoose.models.User ||
    mongoose.model("User", UserSchema);


    // import { NextResponse } from "next/server";
    
    // export function middleware(req) {
    //     const token = req.cookies.get("token")?.value;
    
    //     const isLoginPage = req.nextUrl.pathname === "/login";
    
    //     if (!token && !isLoginPage) {
    //         return NextResponse.redirect(new URL("/login", req.url));
    //     }
    
    //     return NextResponse.next();
    // }
    
    // export const config = {
    //     matcher: ["/dashboard/:path*"],
    // };