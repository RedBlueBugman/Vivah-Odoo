import { PrismaClient, RFQVendorStatus, PaymentStatus, WeddingStatus, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("Wiping...");
  await prisma.user.deleteMany();
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
  console.log("Wiped.");

  const cats = ["Catering","Decor & Floral","Photography","Videography","DJ & Music","Live Band","Lighting","Venue","Mehendi Artist","Makeup & Hair","Wedding Planner","Transportation","Invitation Design","Tent & Furniture","Fireworks & Special Effects","Horse & Baraat","Choreography","Anchoring & Emcee","Pandit & Rituals","Jewellery & Styling","Cake & Desserts","Drone Services","Photo Booth","Security","Hotel & Accommodation"];
  const categoryMap: Record<string, string> = {};
  for (const name of cats) {
    const c = await prisma.vendorCategory.create({ data: { name } });
    categoryMap[name] = c.id;
  }
  console.log("25 categories done.");
  const grandMughal = await prisma.vendor.create({ data: { name:"Grand Mughal Caterers", categoryId:categoryMap["Catering"], contactPerson:"Rajesh Sharma", email:"rajesh@grandmughal.in", phone:"9876543210", rating:5, paymentPreference:"Bank Transfer" }});
  const royalFeast  = await prisma.vendor.create({ data: { name:"Royal Feast Caterers",  categoryId:categoryMap["Catering"], contactPerson:"Anil Verma",    email:"anil@royalfeast.in",   phone:"9876543211", rating:4, paymentPreference:"Cheque" }});
  const tasteOfRaj  = await prisma.vendor.create({ data: { name:"Taste of Raj",          categoryId:categoryMap["Catering"], contactPerson:"Pradeep Singh", email:"pradeep@tasteofraj.in",phone:"9876543212", rating:3, paymentPreference:"Cash" }});
  const djRavish    = await prisma.vendor.create({ data: { name:"DJ Ravish Entertainment",categoryId:categoryMap["DJ & Music"],contactPerson:"Ravish Kumar", email:"ravish@djravish.in",   phone:"9876543213", rating:4, paymentPreference:"Bank Transfer" }});
  await prisma.vendor.create({ data: { name:"Pink City Decor",       categoryId:categoryMap["Decor & Floral"], contactPerson:"Meera Joshi",   email:"meera@pinkcitydecor.in", phone:"9876543214", rating:5, paymentPreference:"Bank Transfer" }});
  await prisma.vendor.create({ data: { name:"Royal Lens Photography", categoryId:categoryMap["Photography"],   contactPerson:"Karan Mehta",   email:"karan@royallens.in",     phone:"9876543215", rating:5, paymentPreference:"Bank Transfer" }});
  await prisma.vendor.create({ data: { name:"Jaipur Lights Co",       categoryId:categoryMap["Lighting"],      contactPerson:"Suresh Patel",  email:"suresh@jaipurlights.in", phone:"9876543216", rating:4, paymentPreference:"Cheque" }});
  await prisma.vendor.create({ data: { name:"Royal Transport",        categoryId:categoryMap["Transportation"],contactPerson:"Vikram Singh",  email:"vikram@royaltransport.in",phone:"9876543217",rating:4, paymentPreference:"Cash" }});
  console.log("8 vendors done.");

  await prisma.enquiry.create({ data: { clientName:"Priya Sharma", email:"priya.sharma@gmail.com", phone:"9988776655", eventDate:new Date("2026-12-17"), estimatedPax:500, budget:5000000, status:"BOOKED" }});

  const wedding = await prisma.wedding.create({ data: { coupleName:"Sharma-Gupta", venueCity:"Jaipur", startDate:new Date("2026-12-15"), endDate:new Date("2026-12-17"), totalBudget:5000000, status:WeddingStatus.PLANNING }});

  await prisma.weddingFunction.create({ data: { weddingId:wedding.id, name:"Mehendi",            date:new Date("2026-12-15"), pax:200, venue:"Haveli Exotica, Jaipur" }});
  await prisma.weddingFunction.create({ data: { weddingId:wedding.id, name:"Sangeet",             date:new Date("2026-12-16"), pax:350, venue:"Haveli Exotica, Jaipur" }});
  const weddingFn = await prisma.weddingFunction.create({ data: { weddingId:wedding.id, name:"Wedding & Reception", date:new Date("2026-12-17"), pax:500, venue:"Haveli Exotica, Jaipur" }});
  console.log("Wedding + 3 functions done.");

  const tasks = [
    ["Send venue booking confirmation","2026-10-01"],["Finalize guest list","2026-10-05"],
    ["Issue Catering RFQ","2026-10-07"],["Issue Decor RFQ","2026-10-07"],["Issue Photography RFQ","2026-10-07"],
    ["Issue Videography RFQ","2026-10-08"],["Issue DJ & Music RFQ","2026-10-08"],
    ["Issue Lighting RFQ","2026-10-09"],["Issue Transportation RFQ","2026-10-09"],
    ["Issue Mehendi Artist RFQ","2026-10-10"],["Issue Makeup & Hair RFQ","2026-10-10"],
    ["Select and confirm caterer","2026-10-20"],["Select and confirm decor vendor","2026-10-20"],
    ["Select and confirm photographer","2026-10-21"],["Select and confirm videographer","2026-10-21"],
    ["Select and confirm DJ","2026-10-22"],["Select and confirm lighting vendor","2026-10-22"],
    ["Confirm hotel accommodation block","2026-10-25"],["Collect advance payments from client","2026-10-30"],
    ["Release advance to caterer","2026-11-01"],["Release advance to decor vendor","2026-11-01"],
    ["Finalize Mehendi function run sheet","2026-11-15"],["Finalize Sangeet function run sheet","2026-11-15"],
    ["Finalize Wedding function run sheet","2026-11-15"],["Confirm menu with caterer","2026-11-20"],
    ["Confirm decor theme and palette","2026-11-20"],["Print and dispatch invitations","2026-11-25"],
    ["Conduct venue site visit","2026-11-28"],["Confirm seating arrangement","2026-12-01"],
    ["Pre-event vendor coordination call","2026-12-08"],["Collect mid-payment from client","2026-12-10"],
    ["Release mid-payment to caterer","2026-12-11"],["Prepare day-of contact sheet","2026-12-13"],
    ["Conduct final walkthrough at venue","2026-12-14"],["Collect final payment from client","2026-12-18"],
    ["Release final payment to all vendors","2026-12-20"],["Collect feedback from couple","2026-12-22"],
  ];
  for (const [title, dueDate] of tasks) {
    await prisma.task.create({ data: { weddingId:wedding.id, title, dueDate:new Date(dueDate), status:TaskStatus.TODO }});
  }
  console.log("37 tasks done.");
  const rfq = await prisma.rFQ.create({ data: { weddingId:wedding.id, category:"Catering", description:"Full catering for all 3 functions. Wedding reception: 500 pax.", status:"CLOSED" }});
  await prisma.rFQVendor.create({ data: { rfqId:rfq.id, vendorId:grandMughal.id, status:RFQVendorStatus.SELECTED,     respondedAt:new Date("2026-10-12") }});
  await prisma.rFQVendor.create({ data: { rfqId:rfq.id, vendorId:royalFeast.id,  status:RFQVendorStatus.NOT_SELECTED, respondedAt:new Date("2026-10-13") }});
  await prisma.rFQVendor.create({ data: { rfqId:rfq.id, vendorId:tasteOfRaj.id,  status:RFQVendorStatus.NOT_SELECTED, respondedAt:new Date("2026-10-14") }});
  await prisma.quote.create({ data: { rfqId:rfq.id, vendorId:grandMughal.id, totalAmount:3500000, effectiveCostPax:7000, notes:"Premium menu, live counters, 5-star service staff.", isWinner:true  }});
  await prisma.quote.create({ data: { rfqId:rfq.id, vendorId:royalFeast.id,  totalAmount:3005000, effectiveCostPax:6010, notes:"Standard menu. Limited live counters.",              isWinner:false }});
  await prisma.quote.create({ data: { rfqId:rfq.id, vendorId:tasteOfRaj.id,  totalAmount:2220000, effectiveCostPax:4440, notes:"Budget option. Basic menu.",                         isWinner:false }});
  console.log("RFQ + quotes done.");

  const wv = await prisma.weddingVendor.create({ data: { weddingId:wedding.id, vendorId:grandMughal.id, contractValue:3500000 }});
  await prisma.vendorPaymentTranche.create({ data: { weddingVendorId:wv.id, amount:1050000, dueDate:new Date("2026-11-01"), status:PaymentStatus.PAID,    paidAt:new Date("2026-11-01"), referenceNumber:"NEFT-20261101-001" }});
  await prisma.vendorPaymentTranche.create({ data: { weddingVendorId:wv.id, amount:1400000, dueDate:new Date("2026-12-11"), status:PaymentStatus.PENDING }});
  await prisma.vendorPaymentTranche.create({ data: { weddingVendorId:wv.id, amount:1050000, dueDate:new Date("2026-12-20"), status:PaymentStatus.PENDING }});
  console.log("Payments done.");

  await prisma.timelineEvent.create({ data: { functionId:weddingFn.id, startTime:new Date("2026-12-17T03:30:00.000Z"), endTime:new Date("2026-12-17T17:30:00.000Z"), activity:"DJ Ravish — Setup & Performance" }});
  console.log("Timeline done.");

  const [sh, ch, vh] = await Promise.all([bcrypt.hash("royal@123",10), bcrypt.hash("couple@123",10), bcrypt.hash("vendor@123",10)]);
  await prisma.user.createMany({ data: [
    { email:"ashish@royalknot.com", password:sh, name:"Ashish — Royal Knot Staff", role:"STAFF"  },
    { email:"priya@sharma.com",     password:ch, name:"Priya Sharma",              role:"COUPLE", weddingId:wedding.id },
    { email:"ravish@djravish.in",   password:vh, name:"Ravish Kumar (DJ Ravish)",  role:"VENDOR", vendorId:djRavish.id },
  ]});
  console.log("3 users seeded.");
  console.log("\n🎉 Full seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });