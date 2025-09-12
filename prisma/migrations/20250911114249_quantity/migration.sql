-- AlterTable
ALTER TABLE `PackagePurchase` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Result` MODIFY `url` TEXT NULL;
