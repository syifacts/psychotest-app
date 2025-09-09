-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_preferenceQuestionCode_fkey` FOREIGN KEY (`preferenceQuestionCode`) REFERENCES `PreferenceQuestion`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;
