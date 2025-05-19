import { findAdminByUsername } from "@/lib/admins";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();

  const admin = findAdminByUsername(username);

  if (!admin) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const isValid = bcrypt.compareSync(password, admin.passwordHash);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = signToken({
    id: admin.id,
    username: admin.username,
    role: "admin",
  });

  const response = NextResponse.json({
    message: "Login successful",
    role: "admin",
    token, // <--- add token here
  });

  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

//
