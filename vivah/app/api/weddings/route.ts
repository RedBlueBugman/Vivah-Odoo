import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const weddings = await prisma.wedding.findMany({
      include: {
        functions:    { select: { id: true, name: true, date: true, pax: true } },
        hiredVendors: { include: { vendor: { select: { id: true, name: true } } } },
        _count:       { select: { tasks: true, rfqs: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ weddings });
  } catch (err) {
    console.error("[GET /api/weddings]", err);
    return NextResponse.json({ error: "Failed to fetch weddings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { coupleName, venueCity, startDate, endDate, totalBudget } = await req.json();

    if (!coupleName || !venueCity || !startDate || !endDate || !totalBudget) {
      return NextResponse.json(
        { error: "coupleName, venueCity, startDate, endDate, totalBudget are required" },
        { status: 400 }
      );
    }

    const wedding = await prisma.wedding.create({
      data: {
        coupleName,
        venueCity,
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        totalBudget: Number(totalBudget),
        status:      "PLANNING",
      },
    });

    return NextResponse.json({ wedding }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/weddings]", err);
    return NextResponse.json({ error: "Failed to create wedding" }, { status: 500 });
  }
}