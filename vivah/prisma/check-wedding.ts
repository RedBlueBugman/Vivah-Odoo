import { prisma } from "../lib/prisma";
prisma.wedding.findMany({ select: { id: true, coupleName: true, venueCity: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); prisma.$disconnect(); });