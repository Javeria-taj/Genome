import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always return 200/ok to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpires = expires;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

    // Log the reset link to the console for development/demo purposes
    console.log("-----------------------------------------");
    console.log("PASSWORD RESET REQUESTED");
    console.log(`Email: ${email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log("-----------------------------------------");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}
