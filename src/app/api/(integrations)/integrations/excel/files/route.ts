import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    // In a real application, you would get the access token from a database
    // associated with the current user
    const accessToken = "your_access_token"; // Placeholder

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch Excel files from OneDrive/SharePoint
    const response = await axios.get(
      "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.xlsx')?$top=25",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const files = response.data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
      webUrl: file.webUrl,
      lastModifiedDateTime: file.lastModifiedDateTime,
      size: file.size,
      createdDateTime: file.createdDateTime,
    }));

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Error fetching Excel files:", error);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message || "Failed to fetch Excel files";

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // In a real application, you would get the access token from a database
    // associated with the current user
    const accessToken = "your_access_token"; // Placeholder

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create an empty Excel file
    const response = await axios.post(
      "https://graph.microsoft.com/v1.0/me/drive/root/children",
      {
        name: `${name}.xlsx`,
        file: {},
        "@microsoft.graph.conflictBehavior": "rename",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const file = {
      id: response.data.id,
      name: response.data.name,
      webUrl: response.data.webUrl,
      lastModifiedDateTime: response.data.lastModifiedDateTime,
      size: response.data.size,
      createdDateTime: response.data.createdDateTime,
    };

    return NextResponse.json({ file });
  } catch (error: any) {
    console.error("Error creating Excel file:", error);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message || "Failed to create Excel file";

    return NextResponse.json({ error: message }, { status });
  }
}
