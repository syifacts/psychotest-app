/*
  Warnings:

  - Made the column `testTypeId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_testTypeId_fkey`;

-- DropIndex
DROP INDEX `Payment_testTypeId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` MODIFY `testTypeId` INTEGER NOT NULL,
    MODIFY `amount` INTEGER NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
