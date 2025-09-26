-- AlterTable
ALTER TABLE `Result` ADD COLUMN `kesimpulanBelajar` TEXT NULL,
    ADD COLUMN `kesimpulanKepribadian` TEXT NULL,
    ADD COLUMN `kesimpulanSikap` TEXT NULL;

-- AlterTable
ALTER TABLE `SummaryTemplate` ADD COLUMN `section` VARCHAR(191) NULL;
