import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ?demo=true fixes "now" to 2026-12-17T09:35:00+05:30
// This is 35 minutes after DJ Ravish's 9:00 AM call time — triggers the late alert
const DEMO_NOW = new Date("2026-12-17T04:05:00.000Z"); // 09:35 IST = 04:05 UTC

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isDemo = new URL(req.url).searchParams.get("demo") === "true";
    const now = isDemo ? DEMO_NOW : new Date();

    const functions = await prisma.weddingFunction.findMany({
      where: { weddingId: params.id },
      orderBy: { date: "asc" },
      include: {
        timeline: {
          orderBy: { startTime: "asc" },
          include: {
            checkIns: {
              include: { problems: true },
              orderBy: { timestamp: "desc" },
            },
          },
        },
      },
    });

    if (!functions.length) {
      return NextResponse.json({ error: "No functions found for this wedding" }, { status: 404 });
    }

    // Annotate each timeline event with its alert status
    const annotatedFunctions = functions.map((fn) => ({
      id:       fn.id,
      name:     fn.name,
      date:     fn.date,
      pax:      fn.pax,
      venue:    fn.venue,
      timeline: fn.timeline.map((event) => {
        const hasCheckIn  = event.checkIns.length > 0;
        const isPast      = event.startTime <= now;
        const minutesLate = isPast
          ? Math.floor((now.getTime() - event.startTime.getTime()) / 60000)
          : 0;

        // Alert logic:
        // CHECKED_IN  — has a check-in with status CHECKED_IN
        // LATE        — past start time, zero check-ins
        // UPCOMING    — start time in the future
        const alertStatus = hasCheckIn
          ? "CHECKED_IN"
          : isPast
          ? "LATE"
          : "UPCOMING";

        return {
          id:          event.id,
          activity:    event.activity,
          startTime:   event.startTime,
          endTime:     event.endTime,
          alertStatus,
          minutesLate: alertStatus === "LATE" ? minutesLate : 0,
          checkIns:    event.checkIns,
          problems:    event.checkIns.flatMap((c) => c.problems),
        };
      }),
    }));

    // Summary counts for header bar
    const allEvents   = annotatedFunctions.flatMap((f) => f.timeline);
    const lateCount   = allEvents.filter((e) => e.alertStatus === "LATE").length;
    const checkedIn   = allEvents.filter((e) => e.alertStatus === "CHECKED_IN").length;
    const upcoming    = allEvents.filter((e) => e.alertStatus === "UPCOMING").length;

    return NextResponse.json({
      weddingId: params.id,
      asOf:      now,
      isDemo,
      summary:   { lateCount, checkedIn, upcoming, total: allEvents.length },
      functions: annotatedFunctions,
    });
  } catch (err) {
    console.error("[GET /api/weddings/[id]/dayof]", err);
    return NextResponse.json({ error: "Failed to load day-of data" }, { status: 500 });
  }
}