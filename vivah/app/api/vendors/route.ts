import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const vendors = await prisma.vendor.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ vendors });
  } catch (err) {
    console.error("[GET /api/vendors]", err);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}