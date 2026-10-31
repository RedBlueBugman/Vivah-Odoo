import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: params.id } });
    if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    return NextResponse.json({ enquiry });
  } catch (err) {
    console.error("[GET /api/enquiries/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch enquiry" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const enquiry = await prisma.enquiry.update({
      where: { id: params.id },
      data: {
        ...(data.status       && { status: data.status }),
        ...(data.clientName   && { clientName: data.clientName }),
        ...(data.eventDate    && { eventDate: new Date(data.eventDate) }),
        ...(data.estimatedPax && { estimatedPax: Number(data.estimatedPax) }),
        ...(data.budget       && { budget: Number(data.budget) }),
      },
    });
    return NextResponse.json({ enquiry });
  } catch (err) {
    console.error("[PATCH /api/enquiries/[id]]", err);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}