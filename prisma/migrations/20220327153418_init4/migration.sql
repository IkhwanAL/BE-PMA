/*
  Warnings:

  - The `updatedAt` column on the `subdetailprojectactivity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `description` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `link` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(255) NOT NULL,
    ADD COLUMN `expiredAt` DATETIME(3) NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE `project` MODIFY `createdAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `projectactivity` MODIFY `createdAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `session` MODIFY `expiresAt` DATETIME(3) NOT NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE `subdetailprojectactivity` MODIFY `createdAt` DATETIME(3) NULL,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `createdAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `usertaskfromassignee` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `userteam` MODIFY `addedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
