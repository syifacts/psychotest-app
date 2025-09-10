-- AlterTable
ALTER TABLE `Result` ADD COLUMN `aspekSTK` JSON NULL,
    ADD COLUMN `summaryTemplateId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SummaryTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `minScore` INTEGER NULL,
    `maxScore` INTEGER NULL,
    `template` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_summaryTemplateId_fkey` FOREIGN KEY (`summaryTemplateId`) REFERENCES `SummaryTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
