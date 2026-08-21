"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fromDateKey } from "@/lib/dates";
import { seedDemoProgram } from "@/lib/seed-demo";
import { applyRoadmapImport } from "@/lib/import-roadmap";
import { parseJsonToRoadmap, parseWorkbookToRoadmap, RoadmapValidationError } from "@/lib/roadmap-io";

function revalidateEverything() {
  revalidatePath("/", "layout");
}

export async function toggleTask(taskId: number) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  await prisma.task.update({ where: { id: taskId }, data: { done: !task.done } });
  revalidateEverything();
}

/**
 * Closes a day out. Status is derived from how many tasks ended up done:
 * all done -> CONFIRMED, some done -> RECOVERED (partial credit, used for
 * both same-day partial confirms and late check-ins), none done -> MISSED.
 */
export async function confirmDay(dayId: number) {
  const day = await prisma.day.findUniqueOrThrow({ where: { id: dayId }, include: { tasks: true } });
  const doneCount = day.tasks.filter((t) => t.done).length;
  const total = day.tasks.length;
  const status = doneCount === total && total > 0 ? "CONFIRMED" : doneCount > 0 ? "RECOVERED" : "MISSED";
  const loggedMin = day.tasks.filter((t) => t.done).reduce((s, t) => s + (t.minutes ?? 0), 0);
  await prisma.day.update({
    where: { id: dayId },
    data: { status, confirmedAt: new Date(), loggedMin },
  });
  revalidateEverything();
}

export async function markDayMissed(dayId: number) {
  await prisma.day.update({
    where: { id: dayId },
    data: { status: "MISSED", confirmedAt: null, loggedMin: 0 },
  });
  await prisma.task.updateMany({ where: { dayId }, data: { done: false } });
  revalidateEverything();
}

export type ImportRoadmapState = { error?: string };

/**
 * Parses an uploaded .xlsx or .json roadmap file and, if valid, replaces
 * the entire program with it. Used as a useActionState action so upload
 * errors can be shown inline on the import form.
 */
export async function importRoadmapFile(_prevState: ImportRoadmapState, formData: FormData): Promise<ImportRoadmapState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .xlsx or .json file to upload." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const roadmap = file.name.toLowerCase().endsWith(".json")
      ? parseJsonToRoadmap(new TextDecoder().decode(buffer))
      : parseWorkbookToRoadmap(buffer);
    await applyRoadmapImport(prisma, roadmap);
  } catch (e) {
    if (e instanceof RoadmapValidationError) return { error: e.issues.join(" · ") };
    return { error: e instanceof Error ? e.message : "Could not import this file." };
  }

  revalidateEverything();
  redirect("/");
}

/** Wipes the current roadmap and restores the built-in demo program. */
export async function resetDemoProgram() {
  await seedDemoProgram(prisma);
  revalidateEverything();
  redirect("/");
}

/** Moves the still-open tasks off a lapsed day onto another day's list. */
export async function pushOpenTasksToDay(sourceDayId: number, targetDateKey: string) {
  const [source, target] = await Promise.all([
    prisma.day.findUniqueOrThrow({ where: { id: sourceDayId }, include: { tasks: true } }),
    prisma.day.findUniqueOrThrow({ where: { date: fromDateKey(targetDateKey) }, include: { tasks: true } }),
  ]);

  const openTasks = source.tasks.filter((t) => !t.done);
  if (openTasks.length === 0) return;

  const baseOrder = target.tasks.length > 0 ? Math.max(...target.tasks.map((t) => t.order)) + 1 : 0;

  await prisma.$transaction(
    openTasks.map((t, i) =>
      prisma.task.update({
        where: { id: t.id },
        data: { dayId: target.id, order: baseOrder + i },
      })
    )
  );

  const remaining = source.tasks.length - openTasks.length;
  const note =
    remaining > 0
      ? `${openTasks.length} task${openTasks.length === 1 ? "" : "s"} pushed to ${target.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `Day rescheduled to ${target.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  await prisma.day.update({
    where: { id: source.id },
    data: {
      rescheduleNote: note,
      status: remaining > 0 ? source.status : "MISSED",
    },
  });

  revalidateEverything();
}
