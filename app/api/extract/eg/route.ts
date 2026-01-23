import { PYTHON_BACKEND_URL } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to backend API
    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);
    backendFormData.append("tranche", formData.get("tranche") as string);

    const backendResponse = await fetch(`${PYTHON_BACKEND_URL}/extract/eg`, {
      method: "POST",
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.statusText}`);
    }

    const result = await backendResponse.text();
    const parsedData = JSON.parse(result);

    return Response.json(parsedData);
  } catch (error) {
    console.error("Error in EG form extraction:", error);
    return Response.json(
      { error: "Failed to extract EG form data" },
      { status: 500 },
    );
  }
}
