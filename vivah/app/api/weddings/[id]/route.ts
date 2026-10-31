import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id: params.id },
      include: {
        functions: {
          include: { timeline: { include: { checkIns: { include: { problems: true } } } } },
          orderBy: { date: "asc" },
        },
        tasks: { orderBy: { dueDate: "asc" } },
        rfqs: {
          include: {
            vendors: { include: { vendor: { select: { id: true, name: true } } } },
            quotes:  { include: { vendor: { select: { id: true, name: true } } } },
          },
        },
        hiredVendors: {
          include: {
            vendor:   { select: { id: true, name: true, category: { select: { name: true } } } },
            payments: { orderBy: { dueDate: "asc" } },
          },
        },
      },
    });

    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    return NextResponse.json({ wedding });
  } catch (err) {
    console.error("[GET /api/weddings/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch wedding" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const wedding = await prisma.wedding.update({
      where: { id: params.id },
      data: {
        ...(data.status      && { status: data.status }),
        ...(data.coupleName  && { coupleName: data.coupleName }),
        ...(data.venueCity   && { venueCity: data.venueCity }),
        ...(data.totalBudget && { totalBudget: Number(data.totalBudget) }),
      },
    });
    return NextResponse.json({ wedding });
  } catch (err) {
    console.error("[PATCH /api/weddings/[id]]", err);
    return NextResponse.json({ error: "Failed to update wedding" }, { status: 500 });
  }
}