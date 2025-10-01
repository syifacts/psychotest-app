/*
  Warnings:

  - You are about to alter the column `status` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to drop the column `transactionId` on the `TestAttempt` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_testTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `TestAttempt` DROP FOREIGN KEY `TestAttempt_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_testId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_userId_fkey`;

-- DropIndex
DROP INDEX `Payment_testTypeId_fkey` ON `Payment`;

-- DropIndex
DROP INDEX `TestAttempt_transactionId_fkey` ON `TestAttempt`;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `expiredAt` DATETIME(3) NULL,
    ADD COLUMN `method` VARCHAR(191) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `payload` JSON NULL,
    ADD COLUMN `paymentUrl` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    MODIFY `testTypeId` INTEGER NULL,
    MODIFY `amount` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `TestAttempt` DROP COLUMN `transactionId`;

-- DropTable
DROP TABLE `Transaction`;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_reference_key` ON `Payment`(`reference`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
