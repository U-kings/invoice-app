-- AlterTable
ALTER TABLE "BusinessProfile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "InvoiceSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceNumberPrefix" TEXT NOT NULL DEFAULT 'INV-',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'NGN',
    "defaultPaymentTerm" TEXT NOT NULL DEFAULT 'Due-on-receipt',
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "defaultDiscount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "defaultNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceReminderSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "beforeDueDate3Days" BOOLEAN NOT NULL DEFAULT true,
    "beforeDueDate1Day" BOOLEAN NOT NULL DEFAULT false,
    "onDueDate" BOOLEAN NOT NULL DEFAULT true,
    "afterDueDate1Day" BOOLEAN NOT NULL DEFAULT true,
    "afterDueDate7Days" BOOLEAN NOT NULL DEFAULT true,
    "afterDueDate14Days" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceReminderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSettings_userId_key" ON "InvoiceSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceReminderSettings_userId_key" ON "InvoiceReminderSettings"("userId");

-- AddForeignKey
ALTER TABLE "InvoiceSettings" ADD CONSTRAINT "InvoiceSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceReminderSettings" ADD CONSTRAINT "InvoiceReminderSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
