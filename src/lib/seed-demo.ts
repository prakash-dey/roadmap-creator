import type { PrismaClient } from "@/generated/prisma/client";
import {
  TOTAL_WEEKS,
  WEEK_THEMES,
  DSA_POOL,
  LLD_POOL,
  HLD_POOL,
  MOCK_POOL,
  REVIEW_POOL,
} from "@/lib/program-content";
import { addDays, dateOnly, isoWeekday } from "@/lib/dates";

// Deterministic PRNG (mulberry32) so re-seeding produces the same demo history.
function mulberry32(seed: number) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCycler(pool: string[]) {
  let i = 0;
  return () => {
    const laps = Math.floor(i / pool.length);
    const name = pool[i % pool.length];
    i++;
    return laps > 0 ? `${name} (retake)` : name;
  };
}

type TaskSeed = { category: string; name: string; meta: string; minutes: number };

/**
 * Resets the database to the built-in "The Ascent" demo program: 12 weeks
 * of realistic interview-prep content, with "today" always positioned in
 * week 7 and deterministic (but varied) history seeded before it.
 */
export async function seedDemoProgram(prisma: PrismaClient) {
  const rand = mulberry32(20260821);

  await prisma.task.deleteMany();
  await prisma.day.deleteMany();
  await prisma.week.deleteMany();
  await prisma.settings.deleteMany();

  const today = dateOnly(new Date());
  const currentMonday = addDays(today, -(isoWeekday(today) - 1));
  // Program is designed so "today" always falls in week 7 of 12, keeping the
  // trail's pace visualization meaningful right out of the box.
  const programStart = addDays(currentMonday, -42);
  const todayDayIndex = Math.round((today.getTime() - programStart.getTime()) / 86400000) + 1;

  await prisma.settings.create({
    data: {
      programTitle: "The Ascent",
      programSubtitle: "FAANG Prep · 12-Week Block",
      programStartDate: programStart,
      programWeeksCount: TOTAL_WEEKS,
    },
  });

  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    await prisma.week.create({ data: { number: w, focus: WEEK_THEMES[w] } });
  }

  const nextDSA = makeCycler(DSA_POOL);
  const nextLLD = makeCycler(LLD_POOL);
  const nextHLD = makeCycler(HLD_POOL);
  const nextMOCK = makeCycler(MOCK_POOL);
  const nextREVIEW = makeCycler(REVIEW_POOL);

  const totalDays = TOTAL_WEEKS * 7;

  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    const date = addDays(programStart, dayIndex - 1);
    const weekNumber = Math.ceil(dayIndex / 7);
    const dow = ((dayIndex - 1) % 7) + 1; // 1=Mon ... 7=Sun
    const reviewOnly = dow === 7;
    const isPast = dayIndex < todayDayIndex;
    const isToday = dayIndex === todayDayIndex;

    const taskSeeds: TaskSeed[] = [];
    if (reviewOnly) {
      taskSeeds.push({ category: "REVIEW", name: nextREVIEW(), meta: "REVIEW", minutes: 45 });
    } else if (dow === 1) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 }
      );
    } else if (dow === 2) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "LLD", name: nextLLD(), meta: "50 MIN", minutes: 50 }
      );
    } else if (dow === 3) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "HLD", name: nextHLD(), meta: "40 MIN", minutes: 40 }
      );
    } else if (dow === 4) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "LLD", name: nextLLD(), meta: "50 MIN", minutes: 50 },
        { category: "HLD", name: nextHLD(), meta: "40 MIN", minutes: 40 },
        { category: "MOCK", name: nextMOCK(), meta: "45 MIN · 19:00", minutes: 45 }
      );
    } else if (dow === 5) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "HLD", name: nextHLD(), meta: "40 MIN", minutes: 40 }
      );
    } else if (dow === 6) {
      taskSeeds.push(
        { category: "DSA", name: nextDSA(), meta: "35 MIN", minutes: 35 },
        { category: "LLD", name: nextLLD(), meta: "50 MIN", minutes: 50 }
      );
    }

    const estimateMin = taskSeeds.reduce((s, t) => s + t.minutes, 0);

    let status: "PENDING" | "CONFIRMED" | "MISSED" | "RECOVERED" = "PENDING";
    let doneFlags: boolean[] = taskSeeds.map(() => false);
    let confirmedAt: Date | null = null;

    if (isPast) {
      const roll = rand();
      const confirmedThreshold = reviewOnly ? 0.85 : 0.72;
      const recoveredThreshold = reviewOnly ? 1 : 0.9;
      if (roll < confirmedThreshold) {
        status = "CONFIRMED";
        doneFlags = taskSeeds.map(() => true);
        confirmedAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 21, Math.floor(rand() * 50));
      } else if (roll < recoveredThreshold) {
        status = "MISSED";
      } else {
        status = "RECOVERED";
        const doneCount = Math.max(1, Math.round(taskSeeds.length * (0.4 + rand() * 0.3)));
        doneFlags = taskSeeds.map((_, i) => i < doneCount);
        confirmedAt = addDays(date, 1 + Math.floor(rand() * 2));
      }
    } else if (isToday) {
      status = "PENDING";
    }

    const loggedMin = taskSeeds.reduce((s, t, i) => s + (doneFlags[i] ? t.minutes : 0), 0);

    await prisma.day.create({
      data: {
        date,
        weekNumber,
        dayOfWeek: dow,
        status,
        reviewOnly,
        estimateMin,
        loggedMin,
        confirmedAt,
        tasks: {
          create: taskSeeds.map((t, i) => ({
            category: t.category,
            name: t.name,
            meta: t.meta,
            minutes: t.minutes,
            done: doneFlags[i],
            order: i,
          })),
        },
      },
    });
  }

  return { totalDays, totalWeeks: TOTAL_WEEKS, programStart, todayDayIndex };
}
