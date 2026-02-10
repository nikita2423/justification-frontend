import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_API_URL } from "@/lib/utils";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        console.log(`Updating case ${id} status and justification:`, body);

        // Validate status if provided
        if (body.status && !['approved', 'rejected'].includes(body.status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid status. Must be 'approved' or 'rejected'",
                },
                { status: 400 }
            );
        }
        // body.id = id;

        // Forward request to NestJS backend
        const response = await fetch(
            `${NEXT_PUBLIC_API_URL}/cases/${id}/status-justification`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend error:", data);
            return NextResponse.json(
                {
                    success: false,
                    error: data.message || "Failed to update case",
                },
                { status: response.status }
            );
        }

        console.log("Case updated successfully:", data);

        return NextResponse.json(
            {
                success: true,
                case: data,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating case status and justification:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update case status and justification",
            },
            { status: 500 }
        );
    }
}
