import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { referenceNumber: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { referenceNumber } = await req.json();

    if (!referenceNumber?.trim()) {
      return NextResponse.json(
        { error: "referenceNumber is required" },
        { status: 400 }
      );
    }

    // Double-payment hard block
    const existing = await prisma.vendorPaymentTranche.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tranche not found" }, { status: 404 });
    }
    if (existing.status === "PAID") {
      return NextResponse.json(
        { error: "This tranche is already marked as PAID. Double-payment blocked." },
        { status: 409 }
      );
    }

    const tranche = await prisma.vendorPaymentTranche.update({
      where: { id: params.id },
      data: {
        status:          "PAID",
        paidAt:          new Date(),
        referenceNumber: referenceNumber.trim(),
      },
    });

    return NextResponse.json({ tranche });
  } catch (err) {
    console.error("[PATCH /api/payments/[id]]", err);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}