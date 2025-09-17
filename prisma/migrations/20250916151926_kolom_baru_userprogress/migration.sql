/*
  Warnings:

  - A unique constraint covering the columns `[userId,subtest,attemptId]` on the table `UserProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `UserProgress` DROP FOREIGN KEY `UserProgress_userId_fkey`;

-- DropIndex
DROP INDEX `UserProgress_userId_subtest_key` ON `UserProgress`;

-- AlterTable
ALTER TABLE `UserProgress` ADD COLUMN `attemptId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserProgress_userId_subtest_attemptId_key` ON `UserProgress`(`userId`, `subtest`, `attemptId`);

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPackage` ADD CONSTRAINT `UserPackage_packagePurchaseId_fkey` FOREIGN KEY (`packagePurchaseId`) REFERENCES `PackagePurchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
