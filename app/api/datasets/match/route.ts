import { NEXT_PUBLIC_API_URL } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract the item data from request
    const {
      item,
      srcField,
      datasetName,
      datasetType,
      dstField,
      descriptionField,
    } = body;

    if (!item || !srcField || !datasetName) {
      return NextResponse.json(
        { error: "Missing required fields: item, srcField, datasetName" },
        { status: 400 },
      );
    }

    // Get authorization from request headers
    const authHeader = request.headers.get("Authorization") || "";
    console.log("Auth Header:", authHeader);

    // Call the backend similar matches endpoint
    const backendUrl = NEXT_PUBLIC_API_URL;
    const endpoint = `${backendUrl}/datasets/match`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        item,
        srcField,
        datasetName,
        datasetType,
        dstField,
        descriptionField,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}`, details: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Similar matches API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch similar matches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
