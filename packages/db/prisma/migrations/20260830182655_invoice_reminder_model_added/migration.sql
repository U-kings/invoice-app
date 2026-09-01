-- CreateEnum
CREATE TYPE "InvoiceReminderType" AS ENUM ('BEFORE_DUE', 'DUE_DATE', 'OVERDUE');

-- CreateTable
CREATE TABLE "InvoiceReminder" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InvoiceReminderType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceReminder_scheduledFor_sentAt_idx" ON "InvoiceReminder"("scheduledFor", "sentAt");

-- CreateIndex
CREATE INDEX "InvoiceReminder_invoiceId_idx" ON "InvoiceReminder"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceReminder_userId_idx" ON "InvoiceReminder"("userId");

-- AddForeignKey
ALTER TABLE "InvoiceReminder" ADD CONSTRAINT "InvoiceReminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceReminder" ADD CONSTRAINT "InvoiceReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
