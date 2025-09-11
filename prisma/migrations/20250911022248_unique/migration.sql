/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Result` MODIFY `barcode` VARCHAR(30) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Result_barcode_key` ON `Result`(`barcode`);
