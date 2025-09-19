/*
  Warnings:

  - You are about to drop the column `hasilAU` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilBA` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilBU` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilCO` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilDS` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilDV` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilE` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `hasilMI` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `hasilAU`,
    DROP COLUMN `hasilBA`,
    DROP COLUMN `hasilBU`,
    DROP COLUMN `hasilCO`,
    DROP COLUMN `hasilDS`,
    DROP COLUMN `hasilDV`,
    DROP COLUMN `hasilE`,
    DROP COLUMN `hasilMI`,
    ADD COLUMN `hasilAkhir` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SummaryTemplate` ADD COLUMN `category` VARCHAR(191) NULL;
