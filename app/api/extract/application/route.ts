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
    console.log("PYTHON_BACKEND_URL", PYTHON_BACKEND_URL);

    const backendResponse = await fetch(
      `${PYTHON_BACKEND_URL}/extract/application`,
      {
        method: "POST",
        body: backendFormData,
      },
    );

    console.log("Backend response status:", backendResponse);

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.statusText}`);
    }

    const result = await backendResponse.text();
    const parsedData = JSON.parse(result);

    return Response.json(parsedData);
  } catch (error) {
    console.error("Error in application extraction:", error);
    return Response.json(
      { error: "Failed to extract application data" },
      { status: 500 },
    );
  }
}
