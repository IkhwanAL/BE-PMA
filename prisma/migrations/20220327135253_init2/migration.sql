/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `post`;

-- DropTable
DROP TABLE `profile`;

-- CreateTable
CREATE TABLE `Link` (
    `linkId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`linkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `projectId` INTEGER NOT NULL AUTO_INCREMENT,
    `projectName` VARCHAR(191) NOT NULL,
    `projectDescription` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NOT NULL,
    `deadlineInString` VARCHAR(191) NOT NULL,
    `userOwner` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_projectName_key`(`projectName`),
    PRIMARY KEY (`projectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTeam` (
    `teamId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `role` ENUM('Proyek_Manager', 'Tim') NOT NULL DEFAULT 'Tim',
    `addedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserTeam_userId_key`(`userId`),
    PRIMARY KEY (`teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectActivity` (
    `projectActivityId` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `critical` BOOLEAN NOT NULL,
    `progress` DOUBLE NOT NULL,
    `position` ENUM('To_Do', 'Doing', 'Review', 'Done') NOT NULL DEFAULT 'To_Do',
    `timeToComplete` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NOT NULL,
    `parent` VARCHAR(191) NOT NULL,
    `child` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`projectActivityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTaskFromAssignee` (
    `idTask` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NOT NULL,
    `projectActivityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idTask`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubDetailProjectActivity` (
    `subDetailProjectActivityId` INTEGER NOT NULL AUTO_INCREMENT,
    `detailProyekId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isComplete` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` BOOLEAN NOT NULL,

    PRIMARY KEY (`subDetailProjectActivityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `projectActivityId` INTEGER NOT NULL,
    `subDetailProjectActivityId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `Link` ADD CONSTRAINT `Link_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_userOwner_fkey` FOREIGN KEY (`userOwner`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeam` ADD CONSTRAINT `UserTeam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeam` ADD CONSTRAINT `UserTeam_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`projectId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaskFromAssignee` ADD CONSTRAINT `UserTaskFromAssignee_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaskFromAssignee` ADD CONSTRAINT `UserTaskFromAssignee_projectActivityId_fkey` FOREIGN KEY (`projectActivityId`) REFERENCES `ProjectActivity`(`projectActivityId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubDetailProjectActivity` ADD CONSTRAINT `SubDetailProjectActivity_detailProyekId_fkey` FOREIGN KEY (`detailProyekId`) REFERENCES `ProjectActivity`(`projectActivityId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`projectId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_projectActivityId_fkey` FOREIGN KEY (`projectActivityId`) REFERENCES `ProjectActivity`(`projectActivityId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_subDetailProjectActivityId_fkey` FOREIGN KEY (`subDetailProjectActivityId`) REFERENCES `SubDetailProjectActivity`(`subDetailProjectActivityId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
