import { connectDB } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      )
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        class: user.class, // 🔥 ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // ✅ Correct response handling
    const response = NextResponse.json({ message: "Login successful" })

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
