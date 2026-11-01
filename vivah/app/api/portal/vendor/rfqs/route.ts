import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    if (!vendor) return NextResponse.json([]);

    const rfqs = await prisma.rFQ.findMany({
      where: { vendors: { some: { vendorId: vendor.id } } },
      include: { wedding: { select: { coupleName: true, eventDate: true, venueCity: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rfqs.map((r: any) => ({
      ...r,
      wedding: { ...r.wedding, venue: r.wedding.venueCity },
    })));
  } catch (err) {
    console.error("[GET /api/portal/vendor/rfqs]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}