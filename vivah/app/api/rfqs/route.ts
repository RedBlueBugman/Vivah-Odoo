import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get("weddingId");

    const rfqs = await prisma.rFQ.findMany({
      where: weddingId ? { weddingId } : undefined,
      include: {
        vendors: { include: { vendor: { select: { id: true, name: true } } } },
        quotes:  { include: { vendor: { select: { id: true, name: true } } } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ rfqs });
  } catch (err) {
    console.error("[GET /api/rfqs]", err);
    return NextResponse.json({ error: "Failed to fetch RFQs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { weddingId, category, description } = body;

    if (!weddingId || !category) {
      return NextResponse.json(
        { error: "weddingId and category are required" },
        { status: 400 }
      );
    }

    const rfq = await prisma.rFQ.create({
      data: { weddingId, category, description: description ?? null, status: "DRAFT" },
    });

    return NextResponse.json({ rfq }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rfqs]", err);
    return NextResponse.json({ error: "Failed to create RFQ" }, { status: 500 });
  }
}