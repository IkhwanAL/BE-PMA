-- AlterTable
ALTER TABLE `activity` ADD COLUMN `createdAt` DATETIME(3) NULL,
    MODIFY `projectId` INTEGER NULL,
    MODIFY `projectActivityId` INTEGER NULL,
    MODIFY `subDetailProjectActivityId` INTEGER NULL;

-- AlterTable
ALTER TABLE `link` MODIFY `expiredAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);

-- AlterTable
ALTER TABLE `session` MODIFY `expiresAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);
