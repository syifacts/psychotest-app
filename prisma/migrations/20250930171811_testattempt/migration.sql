-- AlterTable
ALTER TABLE `TestAttempt` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
