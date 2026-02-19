-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledJob_scheduledFor_status_idx" ON "ScheduledJob"("scheduledFor", "status");

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
