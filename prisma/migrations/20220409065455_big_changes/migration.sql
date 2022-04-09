/*
  Warnings:

  - Made the column `createdAt` on table `activity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `activity` MODIFY `createdAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `UserTeam_userId_fkey` ON `UserTeam`(`userId`);
