-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPERADMIN', 'USER', 'PSIKOLOG', 'PERUSAHAAN') NOT NULL DEFAULT 'USER',
    `birthDate` DATETIME(3) NULL,
    `gender` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL,
    `education` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `ttd` TEXT NULL,
    `profileImage` VARCHAR(191) NULL,
    `tujuan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lembagalayanan` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration` INTEGER NOT NULL,
    `price` INTEGER NULL,
    `img` VARCHAR(191) NULL,

    UNIQUE INDEX `TestType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration` INTEGER NULL,

    UNIQUE INDEX `SubTest_testTypeId_name_key`(`testTypeId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subTestId` INTEGER NULL,
    `testTypeId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `options` JSON NULL,
    `type` VARCHAR(191) NOT NULL,
    `answer` JSON NULL,
    `answerScores` JSON NULL,
    `aspek` VARCHAR(191) NULL,

    UNIQUE INDEX `Question_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `testTypeId` INTEGER NOT NULL,
    `paymentId` INTEGER NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `packagePurchaseId` INTEGER NULL,
    `reservedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'RESERVED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `attemptId` INTEGER NOT NULL,
    `questionCode` VARCHAR(191) NULL,
    `preferenceQuestionCode` VARCHAR(191) NULL,
    `choice` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NULL,

    UNIQUE INDEX `Answer_attemptId_questionCode_key`(`attemptId`, `questionCode`),
    UNIQUE INDEX `Answer_attemptId_preferenceQuestionCode_key`(`attemptId`, `preferenceQuestionCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubtestResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `subTestId` INTEGER NOT NULL,
    `rw` INTEGER NULL,
    `sw` INTEGER NULL,
    `kategori` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isCompleted` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `SubtestResult_attemptId_subTestId_key`(`attemptId`, `subTestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `attemptId` INTEGER NOT NULL,
    `testTypeId` INTEGER NOT NULL,
    `totalRw` INTEGER NULL,
    `totalSw` INTEGER NULL,
    `swIq` INTEGER NULL,
    `iq` DOUBLE NULL,
    `keteranganiq` VARCHAR(191) NULL,
    `dominasi` VARCHAR(191) NULL,
    `kategoriiq` VARCHAR(191) NULL,
    `jumlahbenar` INTEGER NULL,
    `scoreiq` INTEGER NULL,
    `keteranganiqCPMI` VARCHAR(191) NULL,
    `aspekSTK` JSON NULL,
    `url` TEXT NULL,
    `kesimpulan` TEXT NULL,
    `ttd` TEXT NULL,
    `summaryTemplateId` INTEGER NULL,
    `jumlahA` INTEGER NULL,
    `jumlahB` INTEGER NULL,
    `jumlahAkor` INTEGER NULL,
    `jumlahBkor` INTEGER NULL,
    `Ds` INTEGER NULL,
    `Mi` INTEGER NULL,
    `Au` INTEGER NULL,
    `Co` INTEGER NULL,
    `Bu` INTEGER NULL,
    `Dv` INTEGER NULL,
    `Ba` INTEGER NULL,
    `E` INTEGER NULL,
    `totalSkalaTO` INTEGER NULL,
    `totalSkalaRO` INTEGER NULL,
    `totalSkalaE` INTEGER NULL,
    `totalSkalaO` INTEGER NULL,
    `konversiTO` DOUBLE NULL,
    `konversiRO` DOUBLE NULL,
    `konversiE` DOUBLE NULL,
    `konversiO` DOUBLE NULL,
    `hasilDS` VARCHAR(191) NULL,
    `hasilMI` VARCHAR(191) NULL,
    `hasilAU` VARCHAR(191) NULL,
    `hasilCO` VARCHAR(191) NULL,
    `hasilBU` VARCHAR(191) NULL,
    `hasilDV` VARCHAR(191) NULL,
    `hasilBA` VARCHAR(191) NULL,
    `hasilE` VARCHAR(191) NULL,
    `barcode` VARCHAR(30) NULL,
    `validated` BOOLEAN NOT NULL DEFAULT false,
    `validatedById` INTEGER NULL,
    `validatedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Result_barcode_key`(`barcode`),
    UNIQUE INDEX `Result_attemptId_testTypeId_key`(`attemptId`, `testTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SummaryTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `minScore` INTEGER NULL,
    `maxScore` INTEGER NULL,
    `template` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Norma_Result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `age` INTEGER NOT NULL,
    `rw` INTEGER NOT NULL,
    `sw` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Norma_Iq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sw` INTEGER NOT NULL,
    `iq` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `testTypeId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `companyId` INTEGER NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Norma_Ist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subtest` VARCHAR(10) NOT NULL,
    `age` INTEGER NOT NULL,
    `rw` INTEGER NOT NULL,
    `sw` DOUBLE NOT NULL,

    UNIQUE INDEX `Norma_Ist_subtest_age_rw_key`(`subtest`, `age`, `rw`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `attemptId` INTEGER NULL,
    `subtest` VARCHAR(191) NOT NULL,
    `currentIdx` INTEGER NOT NULL DEFAULT 0,
    `startTime` DATETIME(3) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserProgress_userId_subtest_attemptId_key`(`userId`, `subtest`, `attemptId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreferenceQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `dimension` VARCHAR(191) NULL,
    `content` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,

    UNIQUE INDEX `PreferenceQuestion_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalityResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `testTypeId` INTEGER NOT NULL,
    `attemptId` INTEGER NOT NULL,
    `resultType` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `scores` JSON NOT NULL,
    `url` TEXT NULL,
    `kesimpulan` TEXT NULL,
    `ttd` TEXT NULL,
    `personalityDescriptionId` INTEGER NULL,
    `editDescription` TEXT NULL,
    `editSuggestion` TEXT NULL,
    `editProfession` TEXT NULL,
    `barcode` VARCHAR(30) NULL,
    `validated` BOOLEAN NOT NULL DEFAULT false,
    `validatedById` INTEGER NULL,
    `validatedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PersonalityResult_attemptId_key`(`attemptId`),
    UNIQUE INDEX `PersonalityResult_barcode_key`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `img` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `packageId` INTEGER NOT NULL,
    `testTypeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackagePurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NULL,
    `userId` INTEGER NULL,
    `packageId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `packagePurchaseId` INTEGER NOT NULL,

    UNIQUE INDEX `UserPackage_userId_packagePurchaseId_key`(`userId`, `packagePurchaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalityDescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testTypeId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `suggestions` TEXT NOT NULL,
    `professions` TEXT NOT NULL,

    UNIQUE INDEX `PersonalityDescription_testTypeId_type_key`(`testTypeId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubTest` ADD CONSTRAINT `SubTest_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subTestId_fkey` FOREIGN KEY (`subTestId`) REFERENCES `SubTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_packagePurchaseId_fkey` FOREIGN KEY (`packagePurchaseId`) REFERENCES `PackagePurchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_questionCode_fkey` FOREIGN KEY (`questionCode`) REFERENCES `Question`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubtestResult` ADD CONSTRAINT `SubtestResult_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubtestResult` ADD CONSTRAINT `SubtestResult_subTestId_fkey` FOREIGN KEY (`subTestId`) REFERENCES `SubTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_summaryTemplateId_fkey` FOREIGN KEY (`summaryTemplateId`) REFERENCES `SummaryTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreferenceQuestion` ADD CONSTRAINT `PreferenceQuestion_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityResult` ADD CONSTRAINT `PersonalityResult_personalityDescriptionId_fkey` FOREIGN KEY (`personalityDescriptionId`) REFERENCES `PersonalityDescription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageTest` ADD CONSTRAINT `PackageTest_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageTest` ADD CONSTRAINT `PackageTest_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackagePurchase` ADD CONSTRAINT `PackagePurchase_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackagePurchase` ADD CONSTRAINT `PackagePurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackagePurchase` ADD CONSTRAINT `PackagePurchase_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPackage` ADD CONSTRAINT `UserPackage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPackage` ADD CONSTRAINT `UserPackage_packagePurchaseId_fkey` FOREIGN KEY (`packagePurchaseId`) REFERENCES `PackagePurchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalityDescription` ADD CONSTRAINT `PersonalityDescription_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
