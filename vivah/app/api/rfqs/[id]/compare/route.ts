import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: {
        quotes: {
          include: { vendor: { select: { id: true, name: true, rating: true, paymentPreference: true } } },
        },
        vendors: {
          include: { vendor: { select: { id: true, name: true } } },
        },
      },
    });

    if (!rfq) return NextResponse.json({ error: "RFQ not found" }, { status: 404 });

    // Normalize and sort server-side — UI receives ready-to-render rows
    const rows = rfq.quotes
      .map((q) => ({
        quoteId:         q.id,
        vendorId:        q.vendor.id,
        vendorName:      q.vendor.name,
        rating:          q.vendor.rating,
        paymentPref:     q.vendor.paymentPreference,
        totalAmount:     Number(q.totalAmount),
        effectiveCostPax: q.effectiveCostPax ? Number(q.effectiveCostPax) : null,
        notes:           q.notes,
        isWinner:        q.isWinner,
        submittedAt:     q.submittedAt,
      }))
      // Sort by effectiveCostPax if present, otherwise totalAmount
      .sort((a, b) => {
        const aVal = a.effectiveCostPax ?? a.totalAmount;
        const bVal = b.effectiveCostPax ?? b.totalAmount;
        return aVal - bVal;
      });

    // Vendors invited but no quote yet
    const respondedVendorIds = new Set(rfq.quotes.map((q) => q.vendorId));
    const pending = rfq.vendors
      .filter((rv) => !respondedVendorIds.has(rv.vendorId))
      .map((rv) => ({ vendorId: rv.vendorId, vendorName: rv.vendor.name, status: rv.status }));

    return NextResponse.json({
      rfqId:    rfq.id,
      category: rfq.category,
      status:   rfq.status,
      rows,     // sorted, normalized quotes
      pending,  // invited but not yet responded
    });
  } catch (err) {
    console.error("[GET /api/rfqs/[id]/compare]", err);
    return NextResponse.json({ error: "Failed to build comparison" }, { status: 500 });
  }
}