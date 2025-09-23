/*
  Warnings:

  - You are about to drop the column `aspekSTK` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriiq` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `aspekSTK`,
    DROP COLUMN `kategoriiq`;
