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

    const wedding = await prisma.wedding.findFirst({
      where: { coupleUserId: user.id },
      include: {
        tasks: { orderBy: { dueDate: "asc" } },
        functions: { orderBy: { date: "asc" } },
        hiredVendors: { include: { vendor: { select: { id: true, name: true, category: true } }, payments: true } },
      },
    });

    if (!wedding) return NextResponse.json({ error: "No wedding found" }, { status: 404 });

    const payments = await prisma.vendorPayment.findMany({
      where: { hiredVendor: { weddingId: wedding.id }, paidAt: { not: null } },
    });

    const normalized = {
      ...wedding,
      budget: wedding.totalBudget ?? 0,
      venue: wedding.venueCity ?? "",
      weddingFunctions: wedding.functions ?? [],
      weddingVendors: (wedding.hiredVendors ?? []).map((hv: any) => ({
        ...hv,
        vendor: { ...hv.vendor, category: hv.vendor?.category?.name ?? hv.vendor?.category ?? "" },
        contractValue: hv.agreedAmount ?? 0,
      })),
      payments: payments.map((p: any) => ({
        id: p.id, amount: p.amount ?? 0,
        paidAt: p.paidAt, method: p.method ?? "BANK_TRANSFER", reference: p.reference,
      })),
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("[GET /api/portal/couple/wedding]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}