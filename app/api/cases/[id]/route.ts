import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_API_URL } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log(`Deleting case ${id}`);

    // Forward request to NestJS backend
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/cases/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Backend response status for delete:", response.status);

    // Try to parse JSON if response has content
    let data: any = null;
    const contentType = response.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/json") &&
      response.status !== 204
    ) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn("Failed to parse JSON response:", parseError);
        data = null;
      }
    }

    if (!response.ok) {
      console.error("Backend error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data?.message || "Failed to delete case",
        },
        { status: response.status },
      );
    }

    console.log("Case deleted successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Case deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete case",
      },
      { status: 500 },
    );
  }
}
