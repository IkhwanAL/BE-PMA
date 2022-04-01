-- AlterTable
ALTER TABLE `link` MODIFY `expiredAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);

-- AlterTable
ALTER TABLE `session` MODIFY `expiresAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 1 DAY);

-- AddForeignKey
ALTER TABLE `ProjectActivity` ADD CONSTRAINT `ProjectActivity_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`projectId`) ON DELETE CASCADE ON UPDATE CASCADE;
