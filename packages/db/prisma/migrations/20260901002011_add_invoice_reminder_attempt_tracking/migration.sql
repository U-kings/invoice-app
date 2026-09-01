-- AlterTable
ALTER TABLE "InvoiceReminder" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastError" TEXT;
