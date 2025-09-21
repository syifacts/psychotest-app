-- DropIndex
DROP INDEX `Result_barcodettd_key` ON `Result`;

-- AlterTable
ALTER TABLE `Result` MODIFY `barcodettd` TEXT NULL;
