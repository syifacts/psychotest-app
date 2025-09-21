/*
  Warnings:

  - You are about to drop the column `jumlahAkor1` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor2` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor3` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor4` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor5` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor6` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor7` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor8` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor1` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor2` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor3` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor4` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor5` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor6` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor7` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor8` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `jumlahAkor1`,
    DROP COLUMN `jumlahAkor2`,
    DROP COLUMN `jumlahAkor3`,
    DROP COLUMN `jumlahAkor4`,
    DROP COLUMN `jumlahAkor5`,
    DROP COLUMN `jumlahAkor6`,
    DROP COLUMN `jumlahAkor7`,
    DROP COLUMN `jumlahAkor8`,
    DROP COLUMN `jumlahBkor1`,
    DROP COLUMN `jumlahBkor2`,
    DROP COLUMN `jumlahBkor3`,
    DROP COLUMN `jumlahBkor4`,
    DROP COLUMN `jumlahBkor5`,
    DROP COLUMN `jumlahBkor6`,
    DROP COLUMN `jumlahBkor7`,
    DROP COLUMN `jumlahBkor8`,
    ADD COLUMN `jumlahkor1` INTEGER NULL,
    ADD COLUMN `jumlahkor2` INTEGER NULL,
    ADD COLUMN `jumlahkor3` INTEGER NULL,
    ADD COLUMN `jumlahkor4` INTEGER NULL,
    ADD COLUMN `jumlahkor5` INTEGER NULL,
    ADD COLUMN `jumlahkor6` INTEGER NULL,
    ADD COLUMN `jumlahkor7` INTEGER NULL,
    ADD COLUMN `jumlahkor8` INTEGER NULL;
