-- AlterTable
ALTER TABLE `TestAttempt` ADD COLUMN `packagePurchaseId` INTEGER NULL,
    ALTER COLUMN `isCompleted` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_packagePurchaseId_fkey` FOREIGN KEY (`packagePurchaseId`) REFERENCES `PackagePurchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
