/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `PersonalityResult` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PersonalityResult` ADD COLUMN `barcode` VARCHAR(30) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `editDescription` TEXT NULL,
    ADD COLUMN `editProfession` TEXT NULL,
    ADD COLUMN `editSuggestion` TEXT NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `kesimpulan` TEXT NULL,
    ADD COLUMN `personalityDescriptionId` INTEGER NULL,
    ADD COLUMN `ttd` TEXT NULL,
    ADD COLUMN `url` TEXT NULL,
    ADD COLUMN `validated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `validatedAt` DATETIME(3) NULL,
    ADD COLUMN `validatedById` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PersonalityResult_barcode_key` ON `PersonalityResult`(`barcode`);

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_personalityDescriptionId_fkey` FOREIGN KEY (`personalityDescriptionId`) REFERENCES `PersonalityDescription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
