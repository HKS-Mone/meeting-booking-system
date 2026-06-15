-- AlterTable
ALTER TABLE `Booking`
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `date` DATE NOT NULL,
    MODIFY `startTime` TIME(0) NOT NULL,
    MODIFY `endTime` TIME(0) NOT NULL;
