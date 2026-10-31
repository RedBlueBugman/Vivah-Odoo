import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { vendorIds: string[] }
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { vendorIds } = await req.json();

    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return NextResponse.json({ error: "vendorIds array is required" }, { status: 400 });
    }

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } });
    if (!rfq) return NextResponse.json({ error: "RFQ not found" }, { status: 404 });

    // createMany with skipDuplicates — safe to call multiple times
    const result = await prisma.rFQVendor.createMany({
      data: vendorIds.map((vendorId: string) => ({
        rfqId: params.id,
        vendorId,
        status: "INVITED",
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ invited: result.count }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rfqs/[id]/invite]", err);
    return NextResponse.json({ error: "Failed to invite vendors" }, { status: 500 });
  }
}