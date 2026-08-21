import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { seedDemoProgram } from "../src/lib/seed-demo";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
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
