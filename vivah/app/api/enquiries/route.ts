import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ enquiries });
  } catch (err) {
    console.error("[GET /api/enquiries]", err);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, email, phone, eventDate, estimatedPax, budget } = await req.json();

    if (!clientName || !email || !phone) {
      return NextResponse.json(
        { error: "clientName, email, and phone are required" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        clientName,
        email,
        phone,
        eventDate:    eventDate    ? new Date(eventDate) : null,
        estimatedPax: estimatedPax ? Number(estimatedPax) : null,
        budget:       budget       ? Number(budget) : null,
        status: "LEAD",
      },
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/enquiries]", err);
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}