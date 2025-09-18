/*
  Warnings:

  - You are about to drop the column `ttd` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `ttd`,
    ADD COLUMN `ttdHash` TEXT NULL,
    ADD COLUMN `ttdUrl` VARCHAR(191) NULL;
