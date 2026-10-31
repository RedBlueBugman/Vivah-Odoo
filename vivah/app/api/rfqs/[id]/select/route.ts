import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { winnerId: string, weddingId: string, tranches: { amount: number, dueDate: string }[] }
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { winnerId, weddingId, tranches } = await req.json();

    if (!winnerId || !weddingId || !Array.isArray(tranches) || tranches.length === 0) {
      return NextResponse.json(
        { error: "winnerId, weddingId, and tranches[] are required" },
        { status: 400 }
      );
    }

    // Validate RFQ exists and is not already CLOSED with a winner
    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { quotes: true, vendors: true },
    });

    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    const alreadyHasWinner = rfq.quotes.some((q) => q.isWinner);
    if (alreadyHasWinner) {
      return NextResponse.json(
        { error: "A winner has already been selected for this RFQ. Cannot re-select." },
        { status: 409 }
      );
    }

    const winningQuote = rfq.quotes.find((q) => q.vendorId === winnerId);
    if (!winningQuote) {
      return NextResponse.json(
        { error: "No quote found from this vendor for this RFQ" },
        { status: 404 }
      );
    }

    // Compute contract value from winning quote
    const contractValue = winningQuote.totalAmount;

    // All 6 writes in a single atomic transaction
    const [weddingVendor] = await prisma.$transaction([

      // 1. Create WeddingVendor (the contract record)
      prisma.weddingVendor.create({
        data: {
          weddingId,
          vendorId: winnerId,
          contractValue,
          payments: {
            create: tranches.map((t: { amount: number; dueDate: string }) => ({
              amount: t.amount,
              dueDate: new Date(t.dueDate),
              status: "PENDING",
            })),
          },
        },
        include: { payments: true, vendor: { select: { id: true, name: true } } },
      }),

      // 2. Mark winning quote isWinner = true
      prisma.quote.update({
        where: { id: winningQuote.id },
        data: { isWinner: true },
      }),

      // 3. Mark all other quotes isWinner = false
      prisma.quote.updateMany({
        where: { rfqId: params.id, id: { not: winningQuote.id } },
        data: { isWinner: false },
      }),

      // 4. Set winning RFQVendor → SELECTED
      prisma.rFQVendor.updateMany({
        where: { rfqId: params.id, vendorId: winnerId },
        data: { status: "SELECTED", respondedAt: new Date() },
      }),

      // 5. Set all other RFQVendor → NOT_SELECTED
      prisma.rFQVendor.updateMany({
        where: { rfqId: params.id, vendorId: { not: winnerId } },
        data: { status: "NOT_SELECTED" },
      }),

      // 6. Close the RFQ
      prisma.rFQ.update({
        where: { id: params.id },
        data: { status: "CLOSED" },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Vendor selected. Contract and payment schedule created.",
        weddingVendor,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/rfqs/[id]/select]", err);
    return NextResponse.json({ error: "Selection failed" }, { status: 500 });
  }
}