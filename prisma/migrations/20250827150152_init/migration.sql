/*
  Warnings:

  - You are about to drop the column `testTypeId` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subTestId,content]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subTestId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_testTypeId_fkey`;

-- DropIndex
DROP INDEX `Question_testTypeId_fkey` ON `Question`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `testTypeId`,
    ADD COLUMN `subTestId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `SubTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SubTest_testTypeId_name_key`(`testTypeId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Question_subTestId_content_key` ON `Question`(`subTestId`, `content`);

-- AddForeignKey
ALTER TABLE `SubTest` ADD CONSTRAINT `SubTest_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subTestId_fkey` FOREIGN KEY (`subTestId`) REFERENCES `SubTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
