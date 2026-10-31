import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        quotes: {
          include: { rfq: { select: { id: true, category: true, status: true, weddingId: true } } },
          orderBy: { submittedAt: "desc" },
        },
        rfqInvites: {
          include: { rfq: { select: { id: true, category: true, status: true } } },
          orderBy: { invitedAt: "desc" },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (err) {
    console.error("[GET /api/vendors/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}