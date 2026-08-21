-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programTitle" TEXT NOT NULL DEFAULT 'The Ascent',
    "programSubtitle" TEXT NOT NULL DEFAULT 'FAANG Prep · 12-Week Block',
    "programStartDate" DATETIME NOT NULL,
    "programWeeksCount" INTEGER NOT NULL DEFAULT 12
);

-- CreateTable
CREATE TABLE "Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "focus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewOnly" BOOLEAN NOT NULL DEFAULT false,
    "estimateMin" INTEGER NOT NULL DEFAULT 0,
    "loggedMin" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" DATETIME,
    "rescheduleNote" TEXT,
    CONSTRAINT "Day_weekNumber_fkey" FOREIGN KEY ("weekNumber") REFERENCES "Week" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meta" TEXT,
    "minutes" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Task_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Week_number_key" ON "Week"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Day_date_key" ON "Day"("date");

-- CreateIndex
CREATE INDEX "Day_weekNumber_idx" ON "Day"("weekNumber");
