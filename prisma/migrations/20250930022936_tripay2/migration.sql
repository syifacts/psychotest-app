-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_testId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_userId_fkey`;

-- DropIndex
DROP INDEX `Transaction_testId_fkey` ON `Transaction`;

-- DropIndex
DROP INDEX `Transaction_userId_fkey` ON `Transaction`;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `companyId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL,
    MODIFY `testId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
