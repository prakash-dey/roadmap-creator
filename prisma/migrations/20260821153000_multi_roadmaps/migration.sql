-- The previous schema contained only the onboarding demo and had no Auth
-- users. Replace it with an owner-scoped, normalized multi-roadmap schema.
DROP TABLE "Task";
DROP TABLE "Day";
DROP TABLE "Week";
DROP TABLE "Settings";

CREATE TABLE "Roadmap" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL DEFAULT 'The Ascent',
    "programSubtitle" TEXT NOT NULL DEFAULT 'FAANG Prep · 12-Week Block',
    "programStartDate" TIMESTAMP(3) NOT NULL,
    "programWeeksCount" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Week" (
    "id" SERIAL NOT NULL,
    "roadmapId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "focus" TEXT NOT NULL,
    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Day" (
    "id" SERIAL NOT NULL,
    "roadmapId" INTEGER NOT NULL,
    "weekId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "status" "DayStatus" NOT NULL DEFAULT 'PENDING',
    "reviewOnly" BOOLEAN NOT NULL DEFAULT false,
    "estimateMin" INTEGER NOT NULL DEFAULT 0,
    "loggedMin" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "rescheduleNote" TEXT,
    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "dayId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meta" TEXT,
    "minutes" INTEGER,
    "link" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Roadmap_ownerId_updatedAt_idx" ON "Roadmap"("ownerId", "updatedAt");
CREATE UNIQUE INDEX "Week_roadmapId_number_key" ON "Week"("roadmapId", "number");
CREATE UNIQUE INDEX "Day_roadmapId_date_key" ON "Day"("roadmapId", "date");
CREATE INDEX "Day_weekId_idx" ON "Day"("weekId");
CREATE UNIQUE INDEX "Task_dayId_order_key" ON "Task"("dayId", "order");

ALTER TABLE "Week" ADD CONSTRAINT "Week_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Day" ADD CONSTRAINT "Day_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Day" ADD CONSTRAINT "Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
