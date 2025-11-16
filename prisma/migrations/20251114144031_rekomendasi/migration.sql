-- AlterTable
ALTER TABLE `Result` ADD COLUMN `belumLayak` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `layak` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `rekomendasi` TEXT NULL,
    ADD COLUMN `tidakLayak` BOOLEAN NULL DEFAULT false;
