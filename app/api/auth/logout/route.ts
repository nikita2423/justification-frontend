import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear auth cookies
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
