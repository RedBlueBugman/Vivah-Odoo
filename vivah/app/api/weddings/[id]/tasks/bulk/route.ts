import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { tasks: { title: string, dueDate: string }[] }
// Used during booking flow to stamp 35+ tasks from template onto a new wedding
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tasks } = await req.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "tasks[] array is required" }, { status: 400 });
    }

    const wedding = await prisma.wedding.findUnique({ where: { id: params.id } });
    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    const result = await prisma.task.createMany({
      data: tasks.map((t: { title: string; dueDate: string }) => ({
        weddingId: params.id,
        title:     t.title,
        dueDate:   new Date(t.dueDate),
        status:    "TODO",
      })),
    });

    return NextResponse.json({ created: result.count }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/weddings/[id]/tasks/bulk]", err);
    return NextResponse.json({ error: "Failed to bulk create tasks" }, { status: 500 });
  }
}