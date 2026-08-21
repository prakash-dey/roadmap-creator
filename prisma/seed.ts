import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { seedDemoProgram } from "../src/lib/seed-demo";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Run `npx neon env pull`.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

seedDemoProgram(prisma)
  .then(({ totalDays, totalWeeks, programStart, todayDayIndex }) => {
    console.log(`Seeded ${totalDays} days across ${totalWeeks} weeks.`);
    console.log(`Program start: ${programStart.toDateString()}`);
    console.log(`Today is day ${todayDayIndex} (week ${Math.ceil(todayDayIndex / 7)}).`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
