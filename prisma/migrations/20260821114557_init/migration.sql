-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "programTitle" TEXT NOT NULL DEFAULT 'The Ascent',
    "programSubtitle" TEXT NOT NULL DEFAULT 'FAANG Prep · 12-Week Block',
    "programStartDate" TIMESTAMP(3) NOT NULL,
    "programWeeksCount" INTEGER NOT NULL DEFAULT 12,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "focus" TEXT NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewOnly" BOOLEAN NOT NULL DEFAULT false,
    "estimateMin" INTEGER NOT NULL DEFAULT 0,
    "loggedMin" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "rescheduleNote" TEXT,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "dayId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meta" TEXT,
    "minutes" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Week_number_key" ON "Week"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Day_date_key" ON "Day"("date");

-- CreateIndex
CREATE INDEX "Day_weekNumber_idx" ON "Day"("weekNumber");

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_weekNumber_fkey" FOREIGN KEY ("weekNumber") REFERENCES "Week"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
