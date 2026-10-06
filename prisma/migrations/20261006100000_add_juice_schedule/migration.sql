-- CreateTable
CREATE TABLE "ScheduleDay" (
    "weekday" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleDay_pkey" PRIMARY KEY ("weekday")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "weekday" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("weekday","productId")
);

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_weekday_fkey" FOREIGN KEY ("weekday") REFERENCES "ScheduleDay"("weekday") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- One row per weekday so the admin page always has all seven days to edit.
INSERT INTO "ScheduleDay" ("weekday", "updatedAt")
SELECT d, CURRENT_TIMESTAMP FROM generate_series(1, 7) AS d
ON CONFLICT ("weekday") DO NOTHING;
