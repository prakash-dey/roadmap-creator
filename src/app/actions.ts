"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fromDateKey } from "@/lib/dates";
import { requireUser } from "@/lib/auth/session";
import { applyRoadmapImport } from "@/lib/import-roadmap";
import { parseJsonToRoadmap, parseWorkbookToRoadmap, RoadmapValidationError } from "@/lib/roadmap-io";
import { roadmapCacheTag, roadmapListCacheTag } from "@/lib/cache-tags";

function positiveId(value: number): number {
  if (!Number.isInteger(value) || value < 1) throw new Error("Invalid record identifier.");
  return value;
}

export async function setTaskDone(roadmapId: number, taskId: number, done: boolean) {
  const user = await requireUser();
  const roadmap = positiveId(roadmapId);
  const task = positiveId(taskId);
  if (typeof done !== "boolean") throw new Error("Invalid task state.");

  const result = await prisma.task.updateMany({
    where: { id: task, day: { roadmapId: roadmap, roadmap: { ownerId: user.id } } },
    data: { done },
  });
  if (result.count !== 1) throw new Error("Task not found.");
  updateTag(roadmapCacheTag(user.id, roadmap));
}

export async function confirmDay(dayId: number) {
  const user = await requireUser();
  const id = positiveId(dayId);
  const day = await prisma.day.findFirst({ where: { id, roadmap: { ownerId: user.id } }, include: { tasks: true } });
  if (!day) throw new Error("Day not found.");

  const doneCount = day.tasks.filter((task) => task.done).length;
  const total = day.tasks.length;
  const status = doneCount === total && total > 0 ? "CONFIRMED" : doneCount > 0 ? "RECOVERED" : "MISSED";
  const loggedMin = day.tasks.filter((task) => task.done).reduce((sum, task) => sum + (task.minutes ?? 0), 0);
  await prisma.$transaction([
    prisma.day.update({ where: { id }, data: { status, confirmedAt: new Date(), loggedMin } }),
    prisma.roadmap.update({ where: { id: day.roadmapId }, data: { updatedAt: new Date() } }),
  ]);
  updateTag(roadmapCacheTag(user.id, day.roadmapId));
}

export async function markDayMissed(dayId: number) {
  const user = await requireUser();
  const id = positiveId(dayId);
  const day = await prisma.day.findFirst({ where: { id, roadmap: { ownerId: user.id } }, select: { roadmapId: true } });
  if (!day) throw new Error("Day not found.");

  await prisma.$transaction([
    prisma.day.update({ where: { id }, data: { status: "MISSED", confirmedAt: null, loggedMin: 0 } }),
    prisma.task.updateMany({ where: { dayId: id }, data: { done: false } }),
    prisma.roadmap.update({ where: { id: day.roadmapId }, data: { updatedAt: new Date() } }),
  ]);
  updateTag(roadmapCacheTag(user.id, day.roadmapId));
}

export type ImportRoadmapState = { error?: string };

export async function importRoadmapFile(_previous: ImportRoadmapState, formData: FormData): Promise<ImportRoadmapState> {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a .xlsx or .json file to upload." };
  if (file.size > 5 * 1024 * 1024) return { error: "Roadmap files must be smaller than 5 MB." };

  let roadmapId: number;
  try {
    const buffer = await file.arrayBuffer();
    const roadmap = file.name.toLowerCase().endsWith(".json")
      ? parseJsonToRoadmap(new TextDecoder().decode(buffer))
      : parseWorkbookToRoadmap(buffer);
    const created = await applyRoadmapImport(prisma, roadmap, user.id);
    roadmapId = created.roadmapId;
  } catch (error) {
    if (error instanceof RoadmapValidationError) return { error: error.issues.join(" · ") };
    return { error: error instanceof Error ? error.message : "Could not import this file." };
  }

  updateTag(roadmapCacheTag(user.id, roadmapId));
  updateTag(roadmapListCacheTag(user.id));
  redirect(`/?roadmap=${roadmapId}`);
}

export async function deleteRoadmap(roadmapId: number) {
  const user = await requireUser();
  const id = positiveId(roadmapId);
  const result = await prisma.roadmap.deleteMany({ where: { id, ownerId: user.id } });
  if (result.count !== 1) throw new Error("Roadmap not found.");
  updateTag(roadmapCacheTag(user.id, id));
  updateTag(roadmapListCacheTag(user.id));
  redirect("/roadmap");
}

export async function pushOpenTasksToDay(sourceDayId: number, targetDateKey: string) {
  const user = await requireUser();
  const id = positiveId(sourceDayId);
  const source = await prisma.day.findFirst({ where: { id, roadmap: { ownerId: user.id } }, include: { tasks: true } });
  if (!source) throw new Error("Source day not found.");
  const target = await prisma.day.findUnique({
    where: { roadmapId_date: { roadmapId: source.roadmapId, date: fromDateKey(targetDateKey) } },
    include: { tasks: true },
  });
  if (!target) throw new Error("Target day not found in this roadmap.");

  const openTasks = source.tasks.filter((task) => !task.done);
  if (openTasks.length === 0) return;
  const baseOrder = target.tasks.length > 0 ? Math.max(...target.tasks.map((task) => task.order)) + 1 : 0;
  const remaining = source.tasks.length - openTasks.length;
  const note = remaining > 0
    ? `${openTasks.length} task${openTasks.length === 1 ? "" : "s"} pushed to ${target.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : `Day rescheduled to ${target.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  await prisma.$transaction([
    ...openTasks.map((task, index) => prisma.task.update({ where: { id: task.id }, data: { dayId: target.id, order: baseOrder + index } })),
    prisma.day.update({ where: { id: source.id }, data: { rescheduleNote: note, status: remaining > 0 ? source.status : "MISSED" } }),
    prisma.roadmap.update({ where: { id: source.roadmapId }, data: { updatedAt: new Date() } }),
  ]);
  updateTag(roadmapCacheTag(user.id, source.roadmapId));
}
