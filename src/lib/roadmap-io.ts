import * as XLSX from "xlsx";

export type RoadmapTaskRow = {
  week: number;
  day: number; // 1..7, Mon..Sun
  reviewOnly: boolean;
  category: string;
  name: string;
  meta?: string;
  minutes?: number;
  link?: string;
};

export type RoadmapFile = {
  title: string;
  subtitle: string;
  startDate: string; // YYYY-MM-DD
  totalWeeks: number;
  weeks: { number: number; focus: string }[];
  tasks: RoadmapTaskRow[];
};

const SAMPLE_ROADMAP: RoadmapFile = {
  title: "My Roadmap",
  subtitle: "12-Week Plan",
  startDate: new Date().toISOString().slice(0, 10),
  totalWeeks: 12,
  weeks: [
    { number: 1, focus: "Getting started" },
    { number: 2, focus: "Core fundamentals" },
  ],
  tasks: [
    {
      week: 1,
      day: 1,
      reviewOnly: false,
      category: "READING",
      name: "Read chapter 1",
      meta: "30 MIN",
      minutes: 30,
      link: "https://example.com/chapter-1",
    },
    {
      week: 1,
      day: 1,
      reviewOnly: false,
      category: "PRACTICE",
      name: "Complete exercise set A",
      meta: "45 MIN",
      minutes: 45,
    },
    {
      week: 1,
      day: 7,
      reviewOnly: true,
      category: "REVIEW",
      name: "Review week 1 notes",
      meta: "REVIEW",
      minutes: 30,
    },
  ],
};

// ---------- Excel template ----------

export function buildTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const programSheet = XLSX.utils.aoa_to_sheet([
    ["Title", "Subtitle", "Start Date (YYYY-MM-DD)", "Total Weeks"],
    [SAMPLE_ROADMAP.title, SAMPLE_ROADMAP.subtitle, SAMPLE_ROADMAP.startDate, SAMPLE_ROADMAP.totalWeeks],
  ]);
  XLSX.utils.book_append_sheet(wb, programSheet, "Program");

  const weeksSheet = XLSX.utils.aoa_to_sheet([
    ["Week", "Focus"],
    ...SAMPLE_ROADMAP.weeks.map((w) => [w.number, w.focus]),
  ]);
  XLSX.utils.book_append_sheet(wb, weeksSheet, "Weeks");

  const tasksSheet = XLSX.utils.aoa_to_sheet([
    ["Week", "Day (1=Mon..7=Sun)", "Review Only (TRUE/FALSE)", "Category", "Task", "Duration Label", "Minutes", "Link"],
    ...SAMPLE_ROADMAP.tasks.map((t) => [
      t.week,
      t.day,
      t.reviewOnly ? "TRUE" : "FALSE",
      t.category,
      t.name,
      t.meta ?? "",
      t.minutes ?? "",
      t.link ?? "",
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, tasksSheet, "Tasks");

  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ["How to use this template"],
    ["1. Fill in the Program sheet with your roadmap's title, subtitle, start date, and total number of weeks."],
    ["2. Optionally fill in the Weeks sheet with a one-line focus for each week number. Weeks left out get a blank focus."],
    ["3. Add one row per task in the Tasks sheet."],
    ["   - Week: which week number this task belongs to (1..Total Weeks)."],
    ["   - Day: 1=Monday ... 7=Sunday."],
    ["   - Review Only: TRUE marks the whole day as a review/rest day in the UI."],
    ["   - Category: any short label you like (e.g. DSA, READING, WORKOUT, PROJECT) - each gets its own color automatically."],
    ["   - Duration Label: free text shown next to the task, e.g. '30 MIN'."],
    ["   - Minutes: a number, used for time-logged totals. Optional."],
    ["   - Link: a URL. If set, an open-link button appears on the task. Optional."],
    ["4. Save the file and upload it on the Roadmap page. It will be added alongside your existing roadmaps."],
  ]);
  XLSX.utils.book_append_sheet(wb, instructionsSheet, "Instructions");

  return wb;
}

// ---------- JSON template ----------

export function buildTemplateJSON(): RoadmapFile {
  return SAMPLE_ROADMAP;
}

// ---------- Parsing ----------

export class RoadmapValidationError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super(`Roadmap file has ${issues.length} problem${issues.length === 1 ? "" : "s"}: ${issues.join("; ")}`);
    this.issues = issues;
  }
}

function sheetToRows(ws: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false }) as unknown[][];
}

function toStr(v: unknown): string {
  return v === undefined || v === null ? "" : String(v).trim();
}

function toBool(v: unknown): boolean {
  const s = toStr(v).toUpperCase();
  return s === "TRUE" || s === "1" || s === "YES";
}

function toNumOrUndefined(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseWorkbookToRoadmap(buffer: ArrayBuffer): RoadmapFile {
  const wb = XLSX.read(buffer, { type: "array" });

  const programWs = wb.Sheets["Program"];
  if (!programWs) throw new RoadmapValidationError(['Missing "Program" sheet']);
  const programRows = sheetToRows(programWs);
  if (programRows.length < 2) throw new RoadmapValidationError(['"Program" sheet has no data row']);
  const [, dataRow] = programRows;
  const [title, subtitle, startDate, totalWeeksRaw] = dataRow;

  const tasksWs = wb.Sheets["Tasks"];
  if (!tasksWs) throw new RoadmapValidationError(['Missing "Tasks" sheet']);
  const taskRows = sheetToRows(tasksWs).slice(1); // drop header

  const tasks: RoadmapTaskRow[] = taskRows
    .filter((r) => r.some((c) => toStr(c) !== ""))
    .map((r) => ({
      week: Number(r[0]),
      day: Number(r[1]),
      reviewOnly: toBool(r[2]),
      category: toStr(r[3]),
      name: toStr(r[4]),
      meta: toStr(r[5]) || undefined,
      minutes: toNumOrUndefined(r[6]),
      link: toStr(r[7]) || undefined,
    }));

  const weeksWs = wb.Sheets["Weeks"];
  const weeks = weeksWs
    ? sheetToRows(weeksWs)
        .slice(1)
        .filter((r) => toStr(r[0]) !== "")
        .map((r) => ({ number: Number(r[0]), focus: toStr(r[1]) }))
    : [];

  const roadmap: RoadmapFile = {
    title: toStr(title) || "My Roadmap",
    subtitle: toStr(subtitle),
    startDate: toStr(startDate),
    totalWeeks: Number(totalWeeksRaw),
    weeks,
    tasks,
  };

  validateRoadmap(roadmap);
  return roadmap;
}

export function parseJsonToRoadmap(text: string): RoadmapFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new RoadmapValidationError(["File is not valid JSON"]);
  }
  if (typeof raw !== "object" || raw === null) {
    throw new RoadmapValidationError(["JSON root must be an object"]);
  }
  const r = raw as Record<string, unknown>;
  const tasksArr = Array.isArray(r.tasks) ? r.tasks : [];
  const weeksArr = Array.isArray(r.weeks) ? r.weeks : [];

  const roadmap: RoadmapFile = {
    title: toStr(r.title) || "My Roadmap",
    subtitle: toStr(r.subtitle),
    startDate: toStr(r.startDate),
    totalWeeks: Number(r.totalWeeks),
    weeks: weeksArr.map((w) => {
      const wo = (w ?? {}) as Record<string, unknown>;
      return { number: Number(wo.number), focus: toStr(wo.focus) };
    }),
    tasks: tasksArr.map((t) => {
      const to = (t ?? {}) as Record<string, unknown>;
      return {
        week: Number(to.week),
        day: Number(to.day),
        reviewOnly: Boolean(to.reviewOnly),
        category: toStr(to.category),
        name: toStr(to.name),
        meta: toStr(to.meta) || undefined,
        minutes: toNumOrUndefined(to.minutes),
        link: toStr(to.link) || undefined,
      };
    }),
  };

  validateRoadmap(roadmap);
  return roadmap;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateRoadmap(rm: RoadmapFile): void {
  const issues: string[] = [];

  if (!rm.title) issues.push("Program title is required");
  if (rm.title.length > 120) issues.push("Program title must be 120 characters or fewer");
  if (rm.subtitle.length > 240) issues.push("Program subtitle must be 240 characters or fewer");
  if (!DATE_RE.test(rm.startDate)) issues.push(`Start date must look like YYYY-MM-DD (got "${rm.startDate}")`);
  if (!Number.isInteger(rm.totalWeeks) || rm.totalWeeks < 1 || rm.totalWeeks > 52) {
    issues.push("Total weeks must be a whole number between 1 and 52");
  }
  if (rm.tasks.length === 0) issues.push("Add at least one task");
  if (rm.tasks.length > 5000) issues.push("A roadmap can contain at most 5,000 tasks");

  const seenWeeks = new Set<number>();
  rm.weeks.forEach((week, index) => {
    if (!Number.isInteger(week.number) || week.number < 1 || (Number.isInteger(rm.totalWeeks) && week.number > rm.totalWeeks)) {
      issues.push(`Week row ${index + 2}: number must be between 1 and ${rm.totalWeeks || "Total Weeks"}`);
    }
    if (seenWeeks.has(week.number)) issues.push(`Week row ${index + 2}: week ${week.number} is duplicated`);
    if (week.focus.length > 240) issues.push(`Week row ${index + 2}: focus must be 240 characters or fewer`);
    seenWeeks.add(week.number);
  });

  rm.tasks.forEach((t, i) => {
    const row = i + 2; // account for header row in spreadsheets
    if (!Number.isInteger(t.week) || t.week < 1 || (Number.isInteger(rm.totalWeeks) && t.week > rm.totalWeeks)) {
      issues.push(`Task row ${row}: week must be between 1 and ${rm.totalWeeks || "Total Weeks"}`);
    }
    if (!Number.isInteger(t.day) || t.day < 1 || t.day > 7) {
      issues.push(`Task row ${row}: day must be an integer 1-7`);
    }
    if (!t.category) issues.push(`Task row ${row}: category is required`);
    if (t.category.length > 40) issues.push(`Task row ${row}: category must be 40 characters or fewer`);
    if (!t.name) issues.push(`Task row ${row}: task name is required`);
    if (t.name.length > 500) issues.push(`Task row ${row}: task name must be 500 characters or fewer`);
    if (t.meta && t.meta.length > 120) issues.push(`Task row ${row}: duration label must be 120 characters or fewer`);
    if (t.minutes !== undefined && (!Number.isInteger(t.minutes) || t.minutes < 0 || t.minutes > 1440)) {
      issues.push(`Task row ${row}: minutes must be a whole number between 0 and 1440`);
    }
    if (t.link && !/^https?:\/\//i.test(t.link)) {
      issues.push(`Task row ${row}: link must start with http:// or https://`);
    }
    if (t.link && t.link.length > 2048) issues.push(`Task row ${row}: link must be 2,048 characters or fewer`);
  });

  if (issues.length > 0) throw new RoadmapValidationError(issues);
}
