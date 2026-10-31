import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { timelineEventId, vendorName, status }
// status: "CHECKED_IN" | "LATE"
export async function POST(req: NextRequest) {
  try {
    const { timelineEventId, vendorName, status } = await req.json();

    if (!timelineEventId || !vendorName || !status) {
      return NextResponse.json(
        { error: "timelineEventId, vendorName, and status are required" },
        { status: 400 }
      );
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        timelineEventId,
        vendorName,
        status,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/checkins]", err);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}