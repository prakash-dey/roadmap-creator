import type { PrismaClient } from "@/generated/prisma/client";
import type { RoadmapFile } from "@/lib/roadmap-io";
import { addDays, dateOnly, fromDateKey } from "@/lib/dates";

/**
 * Creates an owner-scoped roadmap. Every day in
 * the range gets created (even ones with no tasks) so the trail and week
 * grid stay contiguous; only days that had at least one task carry that
 * task's reviewOnly flag.
 */
export async function applyRoadmapImport(prisma: PrismaClient, rm: RoadmapFile, ownerId: string) {
  const startDate = dateOnly(fromDateKey(rm.startDate));
  const focusByWeek = new Map(rm.weeks.map((w) => [w.number, w.focus]));
  const tasksByDayKey = new Map<string, RoadmapFile["tasks"]>();
  for (const t of rm.tasks) {
    if (t.week < 1 || t.week > rm.totalWeeks || t.day < 1 || t.day > 7) continue;
    const key = `${t.week}:${t.day}`;
    const list = tasksByDayKey.get(key) ?? [];
    list.push(t);
    tasksByDayKey.set(key, list);
  }

  const totalDays = rm.totalWeeks * 7;

  return prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.create({
      data: {
        ownerId,
        programTitle: rm.title,
        programSubtitle: rm.subtitle,
        programStartDate: startDate,
        programWeeksCount: rm.totalWeeks,
      },
    });

    await tx.week.createMany({
      data: Array.from({ length: rm.totalWeeks }, (_, index) => ({
        roadmapId: roadmap.id,
        number: index + 1,
        focus: focusByWeek.get(index + 1) ?? "",
      })),
    });
    const weeks = await tx.week.findMany({ where: { roadmapId: roadmap.id }, select: { id: true, number: true } });
    const weekIdByNumber = new Map(weeks.map((week) => [week.number, week.id]));

    await tx.day.createMany({
      data: Array.from({ length: totalDays }, (_, index) => {
        const weekNumber = Math.ceil((index + 1) / 7);
        const dayOfWeek = (index % 7) + 1;
        const dayTasks = tasksByDayKey.get(`${weekNumber}:${dayOfWeek}`) ?? [];
        return {
          roadmapId: roadmap.id,
          weekId: weekIdByNumber.get(weekNumber)!,
          date: addDays(startDate, index),
          dayOfWeek,
          reviewOnly: dayTasks.length > 0 && dayTasks.every((task) => task.reviewOnly),
          estimateMin: dayTasks.reduce((sum, task) => sum + (task.minutes ?? 0), 0),
        };
      }),
    });

    const days = await tx.day.findMany({ where: { roadmapId: roadmap.id }, select: { id: true, week: { select: { number: true } }, dayOfWeek: true } });
    const taskRows = days.flatMap((day) =>
      (tasksByDayKey.get(`${day.week.number}:${day.dayOfWeek}`) ?? []).map((task, order) => ({
        dayId: day.id,
        category: task.category,
        name: task.name,
        meta: task.meta ?? null,
        minutes: task.minutes ?? null,
        link: task.link ?? null,
        order,
      }))
    );
    if (taskRows.length > 0) await tx.task.createMany({ data: taskRows });

    return { roadmapId: roadmap.id, totalDays, totalWeeks: rm.totalWeeks };
  });
}
