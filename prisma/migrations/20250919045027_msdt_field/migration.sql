/*
  Warnings:

  - You are about to drop the column `jumlahA` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahAkor` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahB` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahBkor` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `jumlahA`,
    DROP COLUMN `jumlahAkor`,
    DROP COLUMN `jumlahB`,
    DROP COLUMN `jumlahBkor`,
    ADD COLUMN `jumlahA1` INTEGER NULL,
    ADD COLUMN `jumlahA2` INTEGER NULL,
    ADD COLUMN `jumlahA3` INTEGER NULL,
    ADD COLUMN `jumlahA4` INTEGER NULL,
    ADD COLUMN `jumlahA5` INTEGER NULL,
    ADD COLUMN `jumlahA6` INTEGER NULL,
    ADD COLUMN `jumlahA7` INTEGER NULL,
    ADD COLUMN `jumlahA8` INTEGER NULL,
    ADD COLUMN `jumlahAkor1` INTEGER NULL,
    ADD COLUMN `jumlahAkor2` INTEGER NULL,
    ADD COLUMN `jumlahAkor3` INTEGER NULL,
    ADD COLUMN `jumlahAkor4` INTEGER NULL,
    ADD COLUMN `jumlahAkor5` INTEGER NULL,
    ADD COLUMN `jumlahAkor6` INTEGER NULL,
    ADD COLUMN `jumlahAkor7` INTEGER NULL,
    ADD COLUMN `jumlahAkor8` INTEGER NULL,
    ADD COLUMN `jumlahB1` INTEGER NULL,
    ADD COLUMN `jumlahB2` INTEGER NULL,
    ADD COLUMN `jumlahB3` INTEGER NULL,
    ADD COLUMN `jumlahB4` INTEGER NULL,
    ADD COLUMN `jumlahB5` INTEGER NULL,
    ADD COLUMN `jumlahB6` INTEGER NULL,
    ADD COLUMN `jumlahB7` INTEGER NULL,
    ADD COLUMN `jumlahB8` INTEGER NULL,
    ADD COLUMN `jumlahBkor1` INTEGER NULL,
    ADD COLUMN `jumlahBkor2` INTEGER NULL,
    ADD COLUMN `jumlahBkor3` INTEGER NULL,
    ADD COLUMN `jumlahBkor4` INTEGER NULL,
    ADD COLUMN `jumlahBkor5` INTEGER NULL,
    ADD COLUMN `jumlahBkor6` INTEGER NULL,
    ADD COLUMN `jumlahBkor7` INTEGER NULL,
    ADD COLUMN `jumlahBkor8` INTEGER NULL;
