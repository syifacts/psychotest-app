/*
  Warnings:

  - A unique constraint covering the columns `[barcodettd]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Result` ADD COLUMN `barcodettd` VARCHAR(30) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Result_barcodettd_key` ON `Result`(`barcodettd`);
