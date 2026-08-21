import { prisma } from "@/lib/prisma";
import { addDays, dateOnly, formatLongDate, formatMonthDay, toDateKey, weekdayShort } from "@/lib/dates";
import { colorForCategory } from "@/lib/program-content";
import type { DayStatus } from "@/generated/prisma/enums";

export type TaskVM = {
  id: number;
  category: string;
  color: string;
  name: string;
  meta: string | null;
  minutes: number | null;
  link: string | null;
  done: boolean;
  order: number;
};

export type DayVM = {
  id: number;
  dateKey: string;
  dateLabel: string; // "AUG 20"
  longDateLabel: string; // "Thursday, Aug 20"
  weekdayShort: string; // "THU"
  dayNumber: number; // calendar day of month
  weekNumber: number;
  dayOfWeek: number; // 1..7 Mon..Sun
  status: DayStatus;
  reviewOnly: boolean;
  estimateMin: number;
  loggedMin: number;
  rescheduleNote: string | null;
  tasks: TaskVM[];
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
};

export type CheckpointVM = {
  number: number;
  kind: "passed" | "current" | "upcoming" | "finish";
};

export type CoverageVM = { category: string; label: string; color: string; done: number; total: number };

export type RecentLogEntryVM = {
  dateKey: string;
  dateLabel: string;
  summary: string;
  status: DayStatus;
};

export type ProgramView = {
  roadmapId: number;
  programTitle: string;
  programSubtitle: string;
  programStartLabel: string;
  programEndLabel: string;
  totalWeeks: number;
  totalDays: number;
  todayDayIndex: number;
  currentWeekNumber: number;
  weekFocus: string;
  today: DayVM;
  currentWeekDays: DayVM[];
  checkpoints: CheckpointVM[];
  progressFraction: number; // 0..1 actual confirmed progress along the trail
  todayFraction: number; // 0..1 calendar-expected position along the trail
  paceDays: number; // negative = behind, positive = ahead
  daysComplete: number;
  streak: number;
  mocksDone: number;
  mocksTotal: number;
  tasksDone: number;
  tasksTotal: number;
  coverage: CoverageVM[];
  recentLog: RecentLogEntryVM[];
  weekLoad: { totalTasks: number; confirmedDays: number; openDays: number; lapsedDays: number };
};

const KNOWN_CATEGORY_ORDER = ["DSA", "LLD", "HLD", "MOCK", "REVIEW"];

export type RoadmapSummary = {
  id: number;
  title: string;
  subtitle: string;
  totalWeeks: number;
  updatedAt: Date;
};

export async function listRoadmaps(ownerId: string): Promise<RoadmapSummary[]> {
  const roadmaps = await prisma.roadmap.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, programTitle: true, programSubtitle: true, programWeeksCount: true, updatedAt: true },
  });
  return roadmaps.map((roadmap) => ({
    id: roadmap.id,
    title: roadmap.programTitle,
    subtitle: roadmap.programSubtitle,
    totalWeeks: roadmap.programWeeksCount,
    updatedAt: roadmap.updatedAt,
  }));
}

function toDayVM(
  day: {
    id: number;
    date: Date;
    week: { number: number };
    dayOfWeek: number;
    status: DayStatus;
    reviewOnly: boolean;
    estimateMin: number;
    loggedMin: number;
    rescheduleNote: string | null;
    tasks: {
      id: number;
      category: string;
      name: string;
      meta: string | null;
      minutes: number | null;
      link: string | null;
      done: boolean;
      order: number;
    }[];
  },
  todayDayIndex: number,
  dayIndex: number
): DayVM {
  return {
    id: day.id,
    dateKey: toDateKey(day.date),
    dateLabel: formatMonthDay(day.date),
    longDateLabel: formatLongDate(day.date),
    weekdayShort: weekdayShort(day.date),
    dayNumber: day.date.getDate(),
    weekNumber: day.week.number,
    dayOfWeek: day.dayOfWeek,
    status: day.status,
    reviewOnly: day.reviewOnly,
    estimateMin: day.estimateMin,
    loggedMin: day.loggedMin,
    rescheduleNote: day.rescheduleNote,
    tasks: [...day.tasks]
      .sort((a, b) => a.order - b.order)
      .map((t) => ({
        id: t.id,
        category: t.category,
        color: colorForCategory(t.category),
        name: t.name,
        meta: t.meta,
        minutes: t.minutes,
        link: t.link,
        done: t.done,
        order: t.order,
      })),
    isToday: dayIndex === todayDayIndex,
    isPast: dayIndex < todayDayIndex,
    isFuture: dayIndex > todayDayIndex,
  };
}

function computeTodayDayIndex(programStart: Date): number {
  const today = dateOnly(new Date());
  return Math.round((today.getTime() - dateOnly(programStart).getTime()) / 86400000) + 1;
}

export async function getProgramView(ownerId: string, roadmapId?: number): Promise<ProgramView | null> {
  const roadmap = await prisma.roadmap.findFirst({
    where: { ownerId, ...(roadmapId ? { id: roadmapId } : {}) },
    orderBy: { updatedAt: "desc" },
    include: {
      weeks: { orderBy: { number: "asc" } },
      days: { orderBy: { date: "asc" }, include: { week: { select: { number: true } }, tasks: { orderBy: { order: "asc" } } } },
    },
  });
  if (!roadmap) return null;

  const totalWeeks = roadmap.programWeeksCount;
  const totalDays = totalWeeks * 7;
  const programStart = dateOnly(roadmap.programStartDate);
  const todayDayIndex = computeTodayDayIndex(programStart);
  const currentWeekNumber = Math.min(totalWeeks, Math.max(1, Math.ceil(todayDayIndex / 7)));

  const dayVMs = roadmap.days.map((day, index) => toDayVM(day, todayDayIndex, index + 1));
  const todayVM = dayVMs.find((d) => d.isToday) ?? dayVMs[dayVMs.length - 1];

  const week = roadmap.weeks.find((item) => item.number === currentWeekNumber);

  const currentWeekDays = dayVMs.filter((d) => d.weekNumber === currentWeekNumber);

  // Trail checkpoints: position along the trail reflects calendar week, not
  // per-day completion (mirrors the design's "trail" concept).
  const checkpoints: CheckpointVM[] = Array.from({ length: totalWeeks }, (_, i) => {
    const n = i + 1;
    if (n === totalWeeks) return { number: n, kind: "finish" as const };
    if (n < currentWeekNumber) return { number: n, kind: "passed" as const };
    if (n === currentWeekNumber) return { number: n, kind: "current" as const };
    return { number: n, kind: "upcoming" as const };
  });

  const pastDays = dayVMs.filter((d) => d.isPast);
  const daysComplete = pastDays.filter((d) => d.status === "CONFIRMED" || d.status === "RECOVERED").length;
  const calendarElapsed = todayDayIndex - 1; // full days before today
  const paceDays = daysComplete - calendarElapsed;

  // Streak: consecutive CONFIRMED days walking back from yesterday. A
  // RECOVERED (late, partial-credit) day breaks the streak by design.
  let streak = 0;
  for (let i = pastDays.length - 1; i >= 0; i--) {
    if (pastDays[i].status === "CONFIRMED") streak++;
    else break;
  }

  const elapsedDays = dayVMs.filter((d) => !d.isFuture); // includes today
  const allTasksElapsed = elapsedDays.flatMap((d) => d.tasks);
  const allTasks = dayVMs.flatMap((d) => d.tasks);

  // Category set is whatever the roadmap actually uses (known categories
  // first, in their usual order, then any custom ones alphabetically) so
  // imported roadmaps with their own labels render sensibly too.
  const distinctCategories = Array.from(new Set(allTasks.map((t) => t.category)));
  const orderedCategories = [
    ...KNOWN_CATEGORY_ORDER.filter((c) => distinctCategories.includes(c)),
    ...distinctCategories.filter((c) => !KNOWN_CATEGORY_ORDER.includes(c)).sort(),
  ];
  const coverage: CoverageVM[] = orderedCategories.map((cat) => {
    const forCat = allTasksElapsed.filter((t) => t.category === cat);
    return {
      category: cat,
      label: cat,
      color: colorForCategory(cat),
      done: forCat.filter((t) => t.done).length,
      total: forCat.length,
    };
  });

  const allMocks = allTasks.filter((t) => t.category === "MOCK");
  const mocksDone = allMocks.filter((t) => t.done).length;
  const mocksTotal = allMocks.length;
  const tasksDone = allTasks.filter((t) => t.done).length;
  const tasksTotal = allTasks.length;

  const recentLog: RecentLogEntryVM[] = pastDays
    .slice(-6)
    .reverse()
    .map((d) => {
      const doneCount = d.tasks.filter((t) => t.done).length;
      let summary: string;
      if (d.rescheduleNote) summary = d.rescheduleNote;
      else if (d.status === "CONFIRMED") summary = `${d.tasks.length} tasks · ${formatMinutes(d.loggedMin)} logged`;
      else if (d.status === "RECOVERED") summary = `${doneCount} of ${d.tasks.length} tasks · closed late`;
      else summary = `${d.tasks.length} tasks · 0m logged`;
      return { dateKey: d.dateKey, dateLabel: d.dateLabel, summary, status: d.status };
    });

  const weekLoad = {
    totalTasks: currentWeekDays.reduce((s, d) => s + d.tasks.length, 0),
    confirmedDays: currentWeekDays.filter((d) => d.status === "CONFIRMED").length,
    openDays: currentWeekDays.filter((d) => d.status === "PENDING").length,
    lapsedDays: currentWeekDays.filter((d) => d.status === "MISSED" || d.status === "RECOVERED").length,
  };

  return {
    roadmapId: roadmap.id,
    programTitle: roadmap.programTitle,
    programSubtitle: roadmap.programSubtitle,
    programStartLabel: formatMonthDay(programStart),
    programEndLabel: formatMonthDay(addDays(programStart, totalDays - 1)),
    totalWeeks,
    totalDays,
    todayDayIndex,
    currentWeekNumber,
    weekFocus: week?.focus ?? "",
    today: todayVM,
    currentWeekDays,
    checkpoints,
    progressFraction: clamp01(daysComplete / totalDays),
    todayFraction: clamp01(todayDayIndex / totalDays),
    paceDays,
    daysComplete,
    streak,
    mocksDone,
    mocksTotal,
    tasksDone,
    tasksTotal,
    coverage,
    recentLog,
    weekLoad,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
