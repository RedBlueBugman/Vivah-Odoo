import { prisma } from "../lib/prisma";

const WEDDING_ID = "cmvwwz1lt00167v4nw32bj3a8";

async function main() {
  const mehendi = await prisma.weddingFunction.upsert({
    where: { id: "fn-mehendi-2026" },
    update: {},
    create: {
      id: "fn-mehendi-2026",
      weddingId: WEDDING_ID,
      name: "Mehendi",
      date: new Date("2026-12-15T00:00:00.000Z"),
      venue: "Garden Lawn, Grand Mughal",
      pax: 150,
    },
  });

  const sangeet = await prisma.weddingFunction.upsert({
    where: { id: "fn-sangeet-2026" },
    update: {},
    create: {
      id: "fn-sangeet-2026",
      weddingId: WEDDING_ID,
      name: "Sangeet",
      date: new Date("2026-12-16T00:00:00.000Z"),
      venue: "Ballroom, Grand Mughal",
      pax: 300,
    },
  });

  const ceremony = await prisma.weddingFunction.upsert({
    where: { id: "fn-ceremony-2026" },
    update: {},
    create: {
      id: "fn-ceremony-2026",
      weddingId: WEDDING_ID,
      name: "Baraat & Ceremony",
      date: new Date("2026-12-17T00:00:00.000Z"),
      venue: "Main Courtyard, Grand Mughal",
      pax: 500,
    },
  });

  console.log("Functions upserted:", mehendi.name, sangeet.name, ceremony.name);

  const events = [
    {
      id: "tl-floral-setup",
      functionId: ceremony.id,
      activity: "Floral Setup - Pink City Decor",
      startTime: new Date("2026-12-17T01:30:00.000Z"),
      endTime:   new Date("2026-12-17T03:00:00.000Z"),
    },
    {
      id: "tl-dj-ravish",
      functionId: ceremony.id,
      activity: "DJ Setup & Soundcheck - DJ Ravish",
      startTime: new Date("2026-12-17T03:30:00.000Z"),
      endTime:   new Date("2026-12-17T05:00:00.000Z"),
    },
    {
      id: "tl-lighting",
      functionId: ceremony.id,
      activity: "Lighting Rig Check - Jaipur Lights Co",
      startTime: new Date("2026-12-17T05:00:00.000Z"),
      endTime:   new Date("2026-12-17T06:00:00.000Z"),
    },
    {
      id: "tl-baraat",
      functionId: ceremony.id,
      activity: "Baraat Procession",
      startTime: new Date("2026-12-17T07:00:00.000Z"),
      endTime:   new Date("2026-12-17T08:30:00.000Z"),
    },
    {
      id: "tl-ceremony",
      functionId: ceremony.id,
      activity: "Wedding Ceremony (Pheras)",
      startTime: new Date("2026-12-17T09:00:00.000Z"),
      endTime:   new Date("2026-12-17T11:00:00.000Z"),
    },
  ];

  for (const ev of events) {
    await prisma.timelineEvent.upsert({
      where: { id: ev.id },
      update: {},
      create: ev,
    });
    console.log("TimelineEvent:", ev.activity);
  }

  const existing = await prisma.checkIn.findFirst({
    where: { timelineEventId: "tl-dj-ravish" },
  });
  if (existing) {
    console.log("WARNING: CheckIn exists for DJ Ravish - late alert will NOT fire.");
  } else {
    console.log("No CheckIn for DJ Ravish - late alert WILL fire at demo time 09:35 IST");
  }

  console.log("Day-of seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());