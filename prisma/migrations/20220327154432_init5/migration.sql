/*
  Warnings:

  - Made the column `createdAt` on table `link` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiredAt` on table `link` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `link` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expiredAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);

-- AlterTable
ALTER TABLE `session` MODIFY `expiresAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);
