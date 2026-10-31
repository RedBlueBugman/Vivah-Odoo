import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { vendorId, totalAmount, effectiveCostPax?, notes? }
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { vendorId, totalAmount, effectiveCostPax, notes } = await req.json();

    if (!vendorId || totalAmount === undefined) {
      return NextResponse.json(
        { error: "vendorId and totalAmount are required" },
        { status: 400 }
      );
    }

    // Upsert quote + mark RFQVendor as QUOTE_RECEIVED — single transaction
    const [quote] = await prisma.$transaction([
      prisma.quote.upsert({
        where: {
          // No unique constraint on (rfqId, vendorId) — use findFirst then update pattern
          // We create a new quote or replace via delete+create in transaction
          id: "nonexistent", // forces create path
        },
        create: {
          rfqId: params.id,
          vendorId,
          totalAmount,
          effectiveCostPax: effectiveCostPax ?? null,
          notes: notes ?? null,
        },
        update: {},
      }),
      prisma.rFQVendor.updateMany({
        where: { rfqId: params.id, vendorId },
        data: { status: "QUOTE_RECEIVED", respondedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ quote }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rfqs/[id]/quotes]", err);
    return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 });
  }
}