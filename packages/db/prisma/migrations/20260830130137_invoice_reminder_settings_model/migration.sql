/*
  Warnings:

  - You are about to drop the column `afterDueDate14Days` on the `InvoiceReminderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `afterDueDate1Day` on the `InvoiceReminderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `afterDueDate7Days` on the `InvoiceReminderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `beforeDueDate1Day` on the `InvoiceReminderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `beforeDueDate3Days` on the `InvoiceReminderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `onDueDate` on the `InvoiceReminderSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InvoiceReminderSettings" DROP COLUMN "afterDueDate14Days",
DROP COLUMN "afterDueDate1Day",
DROP COLUMN "afterDueDate7Days",
DROP COLUMN "beforeDueDate1Day",
DROP COLUMN "beforeDueDate3Days",
DROP COLUMN "onDueDate",
ADD COLUMN     "beforeDueDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "beforeDueEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "dueDateEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailMessage" TEXT,
ADD COLUMN     "emailSubject" TEXT,
ADD COLUMN     "maxOverdueReminders" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "overdueAfterDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "overdueEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "overdueRepeatDays" INTEGER NOT NULL DEFAULT 7;
