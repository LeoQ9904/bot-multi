/*
  Warnings:

  - The `startedAt` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `completedAt` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `scheduledAt` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "scheduledAt",
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
DROP COLUMN "startedAt",
ADD COLUMN     "startedAt" TIMESTAMP(3),
DROP COLUMN "completedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3);
