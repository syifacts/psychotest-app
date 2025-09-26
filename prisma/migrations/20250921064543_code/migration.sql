/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `TestType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `TestType` ADD COLUMN `code` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TestType_code_key` ON `TestType`(`code`);
