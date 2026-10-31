import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        weddingId: params.id,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[GET /api/weddings/[id]/tasks]", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // PATCH single task status: body { taskId, status }
  try {
    const { taskId, status } = await req.json();
    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status required" }, { status: 400 });
    }
    const task = await prisma.task.update({
      where: { id: taskId, weddingId: params.id },
      data: { status },
    });
    return NextResponse.json({ task });
  } catch (err) {
    console.error("[PATCH /api/weddings/[id]/tasks]", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}