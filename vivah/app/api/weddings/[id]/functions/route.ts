import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, date, venue, pax } = await req.json();

    if (!name || !date || !venue || !pax) {
      return NextResponse.json(
        { error: "name, date, venue, pax are required" },
        { status: 400 }
      );
    }

    const wedding = await prisma.wedding.findUnique({
      where: { id: params.id },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    const fn = await prisma.weddingFunction.create({
      data: {
        weddingId: params.id,
        name,
        date:  new Date(date),
        venue,
        pax:   Number(pax),
      },
    });

    return NextResponse.json({ function: fn }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/weddings/[id]/functions]", err);
    return NextResponse.json({ error: "Failed to create function" }, { status: 500 });
  }
}