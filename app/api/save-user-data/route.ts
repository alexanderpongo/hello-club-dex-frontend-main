import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const body = await req.text();
    let parsedData;

    try {
      parsedData = JSON.parse(body);
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const { ipAddress, timeSpent } = parsedData;

    if (!ipAddress || typeof timeSpent !== "number") {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    try {
      // Save the data to the database
      // console.log('Saving data:', { ipAddress, timeSpent });

      return NextResponse.json(
        { message: "Data saved successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error saving data:", error);
      return NextResponse.json(
        { message: "Failed to save data" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }
}
