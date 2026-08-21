import type { PrismaClient } from "@/generated/prisma/client";
import type { RoadmapFile } from "@/lib/roadmap-io";
import { addDays, dateOnly, fromDateKey } from "@/lib/dates";

/**
 * Replaces the entire program with a user-authored roadmap. Every day in
 * the range gets created (even ones with no tasks) so the trail and week
 * grid stay contiguous; only days that had at least one task carry that
 * task's reviewOnly flag.
 */
export async function applyRoadmapImport(prisma: PrismaClient, rm: RoadmapFile) {
  await prisma.task.deleteMany();
  await prisma.day.deleteMany();
  await prisma.week.deleteMany();
  await prisma.settings.deleteMany();

  const startDate = dateOnly(fromDateKey(rm.startDate));

  await prisma.settings.create({
    data: {
      programTitle: rm.title,
      programSubtitle: rm.subtitle,
      programStartDate: startDate,
      programWeeksCount: rm.totalWeeks,
    },
  });

  const focusByWeek = new Map(rm.weeks.map((w) => [w.number, w.focus]));
  for (let w = 1; w <= rm.totalWeeks; w++) {
    await prisma.week.create({ data: { number: w, focus: focusByWeek.get(w) ?? "" } });
  }

  const tasksByDayKey = new Map<string, RoadmapFile["tasks"]>();
  for (const t of rm.tasks) {
    if (t.week < 1 || t.week > rm.totalWeeks || t.day < 1 || t.day > 7) continue;
    const key = `${t.week}:${t.day}`;
    const list = tasksByDayKey.get(key) ?? [];
    list.push(t);
    tasksByDayKey.set(key, list);
  }

  const totalDays = rm.totalWeeks * 7;
  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    const date = addDays(startDate, dayIndex - 1);
    const weekNumber = Math.ceil(dayIndex / 7);
    const dow = ((dayIndex - 1) % 7) + 1;
    const dayTasks = tasksByDayKey.get(`${weekNumber}:${dow}`) ?? [];
    const reviewOnly = dayTasks.length > 0 && dayTasks.every((t) => t.reviewOnly);
    const estimateMin = dayTasks.reduce((s, t) => s + (t.minutes ?? 0), 0);

    await prisma.day.create({
      data: {
        date,
        weekNumber,
        dayOfWeek: dow,
        status: "PENDING",
        reviewOnly,
        estimateMin,
        loggedMin: 0,
        tasks: {
          create: dayTasks.map((t, i) => ({
            category: t.category,
            name: t.name,
            meta: t.meta ?? null,
            minutes: t.minutes ?? null,
            link: t.link ?? null,
            done: false,
            order: i,
          })),
        },
      },
    });
  }

  return { totalDays, totalWeeks: rm.totalWeeks };
}
