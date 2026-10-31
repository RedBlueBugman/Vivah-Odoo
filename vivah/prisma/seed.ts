import { PrismaClient, RFQVendorStatus, PaymentStatus, WeddingStatus, TaskStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Wiping existing data...");
  await prisma.problemFlag.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.vendorPaymentTranche.deleteMany();
  await prisma.weddingVendor.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.rFQVendor.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.task.deleteMany();
  await prisma.weddingFunction.deleteMany();
  await prisma.wedding.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.vendorCategory.deleteMany();
  console.log("✅ Wiped.");

  // ── 25 CATEGORIES ──────────────────────────────────────────
  console.log("📦 Seeding categories...");
  const categoryNames = [
    "Catering", "Decor & Floral", "Photography", "Videography",
    "DJ & Music", "Live Band", "Lighting", "Venue",
    "Mehendi Artist", "Makeup & Hair", "Wedding Planner",
    "Transportation", "Invitation Design", "Tent & Furniture",
    "Fireworks & Special Effects", "Horse & Baraat", "Choreography",
    "Anchoring & Emcee", "Pandit & Rituals", "Jewellery & Styling",
    "Cake & Desserts", "Drone Services", "Photo Booth",
    "Security", "Hotel & Accommodation",
  ];
  const categoryMap: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.vendorCategory.create({ data: { name } });
    categoryMap[name] = cat.id;
  }
  console.log(`✅ ${categoryNames.length} categories created.`);

  // ── 8 VENDORS ──────────────────────────────────────────────
  console.log("🏢 Seeding vendors...");
  const grandMughal = await prisma.vendor.create({ data: {
    name: "Grand Mughal Caterers", categoryId: categoryMap["Catering"],
    contactPerson: "Rajesh Sharma", email: "rajesh@grandmughal.in",
    phone: "9876543210", rating: 5, paymentPreference: "Bank Transfer",
  }});
  const royalFeast = await prisma.vendor.create({ data: {
    name: "Royal Feast Caterers", categoryId: categoryMap["Catering"],
    contactPerson: "Anil Verma", email: "anil@royalfeast.in",
    phone: "9876543211", rating: 4, paymentPreference: "Cheque",
  }});
  const tasteOfRaj = await prisma.vendor.create({ data: {
    name: "Taste of Raj", categoryId: categoryMap["Catering"],
    contactPerson: "Pradeep Singh", email: "pradeep@tasteofraj.in",
    phone: "9876543212", rating: 3, paymentPreference: "Cash",
  }});
  const djRavish = await prisma.vendor.create({ data: {
    name: "DJ Ravish Entertainment", categoryId: categoryMap["DJ & Music"],
    contactPerson: "Ravish Kumar", email: "ravish@djravish.in",
    phone: "9876543213", rating: 4, paymentPreference: "Bank Transfer",
  }});
  await prisma.vendor.create({ data: {
    name: "Pink City Decor", categoryId: categoryMap["Decor & Floral"],
    contactPerson: "Meera Joshi", email: "meera@pinkcitydecor.in",
    phone: "9876543214", rating: 5, paymentPreference: "Bank Transfer",
  }});
  await prisma.vendor.create({ data: {
    name: "Royal Lens Photography", categoryId: categoryMap["Photography"],
    contactPerson: "Karan Mehta", email: "karan@royallens.in",
    phone: "9876543215", rating: 5, paymentPreference: "Bank Transfer",
  }});
  await prisma.vendor.create({ data: {
    name: "Jaipur Lights Co", categoryId: categoryMap["Lighting"],
    contactPerson: "Suresh Patel", email: "suresh@jaipurlights.in",
    phone: "9876543216", rating: 4, paymentPreference: "Cheque",
  }});
  await prisma.vendor.create({ data: {
    name: "Royal Transport", categoryId: categoryMap["Transportation"],
    contactPerson: "Vikram Singh", email: "vikram@royaltransport.in",
    phone: "9876543217", rating: 4, paymentPreference: "Cash",
  }});
  console.log("✅ 8 vendors created.");

  // ── ENQUIRY ────────────────────────────────────────────────
  await prisma.enquiry.create({ data: {
    clientName: "Priya Sharma", email: "priya.sharma@gmail.com",
    phone: "9988776655", eventDate: new Date("2026-12-17"),
    estimatedPax: 500, budget: 5000000, status: "BOOKED",
  }});
  console.log("✅ Enquiry created.");

  // ── WEDDING ────────────────────────────────────────────────
  console.log("💍 Seeding Sharma-Gupta wedding...");
  const wedding = await prisma.wedding.create({ data: {
    coupleName: "Sharma-Gupta", venueCity: "Jaipur",
    startDate: new Date("2026-12-15"), endDate: new Date("2026-12-17"),
    totalBudget: 5000000, status: WeddingStatus.PLANNING,
  }});

  // ── 3 FUNCTIONS ────────────────────────────────────────────
  const mehendi = await prisma.weddingFunction.create({ data: {
    weddingId: wedding.id, name: "Mehendi",
    date: new Date("2026-12-15"), pax: 200, venue: "Haveli Exotica, Jaipur",
  }});
  const sangeet = await prisma.weddingFunction.create({ data: {
    weddingId: wedding.id, name: "Sangeet",
    date: new Date("2026-12-16"), pax: 350, venue: "Haveli Exotica, Jaipur",
  }});
  const weddingFn = await prisma.weddingFunction.create({ data: {
    weddingId: wedding.id, name: "Wedding & Reception",
    date: new Date("2026-12-17"), pax: 500, venue: "Haveli Exotica, Jaipur",
  }});
  console.log("✅ 3 functions created.");

  // ── 35 TASKS ───────────────────────────────────────────────
  console.log("✅ Seeding tasks...");
  const taskDefs = [
    { title: "Send venue booking confirmation", dueDate: "2026-10-01" },
    { title: "Finalize guest list", dueDate: "2026-10-05" },
    { title: "Issue Catering RFQ", dueDate: "2026-10-07" },
    { title: "Issue Decor RFQ", dueDate: "2026-10-07" },
    { title: "Issue Photography RFQ", dueDate: "2026-10-07" },
    { title: "Issue Videography RFQ", dueDate: "2026-10-08" },
    { title: "Issue DJ & Music RFQ", dueDate: "2026-10-08" },
    { title: "Issue Lighting RFQ", dueDate: "2026-10-09" },
    { title: "Issue Transportation RFQ", dueDate: "2026-10-09" },
    { title: "Issue Mehendi Artist RFQ", dueDate: "2026-10-10" },
    { title: "Issue Makeup & Hair RFQ", dueDate: "2026-10-10" },
    { title: "Select and confirm caterer", dueDate: "2026-10-20" },
    { title: "Select and confirm decor vendor", dueDate: "2026-10-20" },
    { title: "Select and confirm photographer", dueDate: "2026-10-21" },
    { title: "Select and confirm videographer", dueDate: "2026-10-21" },
    { title: "Select and confirm DJ", dueDate: "2026-10-22" },
    { title: "Select and confirm lighting vendor", dueDate: "2026-10-22" },
    { title: "Confirm hotel accommodation block", dueDate: "2026-10-25" },
    { title: "Collect advance payments from client", dueDate: "2026-10-30" },
    { title: "Release advance to caterer", dueDate: "2026-11-01" },
    { title: "Release advance to decor vendor", dueDate: "2026-11-01" },
    { title: "Finalize Mehendi function run sheet", dueDate: "2026-11-15" },
    { title: "Finalize Sangeet function run sheet", dueDate: "2026-11-15" },
    { title: "Finalize Wedding function run sheet", dueDate: "2026-11-15" },
    { title: "Confirm menu with caterer", dueDate: "2026-11-20" },
    { title: "Confirm decor theme and palette", dueDate: "2026-11-20" },
    { title: "Print and dispatch invitations", dueDate: "2026-11-25" },
    { title: "Conduct venue site visit", dueDate: "2026-11-28" },
    { title: "Confirm seating arrangement", dueDate: "2026-12-01" },
    { title: "Pre-event vendor coordination call", dueDate: "2026-12-08" },
    { title: "Collect mid-payment from client", dueDate: "2026-12-10" },
    { title: "Release mid-payment to caterer", dueDate: "2026-12-11" },
    { title: "Prepare day-of contact sheet for all vendors", dueDate: "2026-12-13" },
    { title: "Conduct final walkthrough at venue", dueDate: "2026-12-14" },
    { title: "Collect final payment from client", dueDate: "2026-12-18" },
    { title: "Release final payment to all vendors", dueDate: "2026-12-20" },
    { title: "Collect feedback from couple", dueDate: "2026-12-22" },
  ];
  for (const t of taskDefs) {
    await prisma.task.create({ data: {
      weddingId: wedding.id, title: t.title,
      dueDate: new Date(t.dueDate), status: TaskStatus.TODO,
    }});
  }
  console.log(`✅ ${taskDefs.length} tasks created.`);

  // ── CATERING RFQ ───────────────────────────────────────────
  console.log("📋 Seeding Catering RFQ...");
  const rfq = await prisma.rFQ.create({ data: {
    weddingId: wedding.id, category: "Catering",
    description: "Full catering for all 3 functions. Wedding reception: 500 pax.",
    status: "CLOSED",
  }});

  // RFQVendor junctions
  await prisma.rFQVendor.create({ data: {
    rfqId: rfq.id, vendorId: grandMughal.id,
    status: RFQVendorStatus.SELECTED,
    respondedAt: new Date("2026-10-12"),
  }});
  await prisma.rFQVendor.create({ data: {
    rfqId: rfq.id, vendorId: royalFeast.id,
    status: RFQVendorStatus.NOT_SELECTED,
    respondedAt: new Date("2026-10-13"),
  }});
  await prisma.rFQVendor.create({ data: {
    rfqId: rfq.id, vendorId: tasteOfRaj.id,
    status: RFQVendorStatus.NOT_SELECTED,
    respondedAt: new Date("2026-10-14"),
  }});

  // Quotes — effectiveCostPax normalized to 500 pax (wedding reception)
  await prisma.quote.create({ data: {
    rfqId: rfq.id, vendorId: grandMughal.id,
    totalAmount: 3500000, effectiveCostPax: 7000,
    notes: "Premium menu, live counters, 5-star service staff.",
    isWinner: true,
  }});
  await prisma.quote.create({ data: {
    rfqId: rfq.id, vendorId: royalFeast.id,
    totalAmount: 3005000, effectiveCostPax: 6010,
    notes: "Standard menu. Limited live counters.",
    isWinner: false,
  }});
  await prisma.quote.create({ data: {
    rfqId: rfq.id, vendorId: tasteOfRaj.id,
    totalAmount: 2220000, effectiveCostPax: 4440,
    notes: "Budget option. Basic menu.",
    isWinner: false,
  }});
  console.log("✅ RFQ, 3 RFQVendors, 3 Quotes created.");

  // ── WEDDING VENDOR (contract) + PAYMENT TRANCHES ───────────
  console.log("💰 Seeding WeddingVendor + payment tranches...");
  const wv = await prisma.weddingVendor.create({ data: {
    weddingId: wedding.id, vendorId: grandMughal.id,
    contractValue: 3500000,
  }});
  await prisma.vendorPaymentTranche.create({ data: {
    weddingVendorId: wv.id, amount: 1050000,
    dueDate: new Date("2026-11-01"),
    status: PaymentStatus.PAID, paidAt: new Date("2026-11-01"),
    referenceNumber: "NEFT-20261101-001",
  }});
  await prisma.vendorPaymentTranche.create({ data: {
    weddingVendorId: wv.id, amount: 1400000,
    dueDate: new Date("2026-12-11"),
    status: PaymentStatus.PENDING,
  }});
  await prisma.vendorPaymentTranche.create({ data: {
    weddingVendorId: wv.id, amount: 1050000,
    dueDate: new Date("2026-12-20"),
    status: PaymentStatus.PENDING,
  }});
  console.log("✅ WeddingVendor + 3 tranches created.");

  // ── DJ RAVISH TIMELINE EVENT (no check-in = demo late alert) ─
  console.log("⏰ Seeding Dec 17 DJ Ravish timeline event...");
  await prisma.timelineEvent.create({ data: {
    functionId: weddingFn.id,
    startTime: new Date("2026-12-17T09:00:00+05:30"),
    endTime: new Date("2026-12-17T23:00:00+05:30"),
    activity: "DJ Ravish — Setup & Performance",
  }});
  // NO CheckIn record created — this is intentional.
  // The day-of command center polls TimelineEvents past startTime with no CheckIn.
  // DJ Ravish shows 35+ minutes late on the live dashboard.
  console.log("✅ DJ Ravish timeline event created. No check-in = late alert demo.");

  console.log("\n🎉 Seed complete. Sharma-Gupta wedding is live in Neon.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });