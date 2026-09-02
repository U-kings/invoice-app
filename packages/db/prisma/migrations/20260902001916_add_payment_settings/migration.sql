-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paystackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cardPayments" BOOLEAN NOT NULL DEFAULT true,
    "bankTransfer" BOOLEAN NOT NULL DEFAULT true,
    "cashPayments" BOOLEAN NOT NULL DEFAULT false,
    "onlinePayments" BOOLEAN NOT NULL DEFAULT true,
    "paymentLinks" BOOLEAN NOT NULL DEFAULT true,
    "partialPayments" BOOLEAN NOT NULL DEFAULT false,
    "automaticPaymentConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "additionalInformation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSettings_userId_key" ON "PaymentSettings"("userId");

-- AddForeignKey
ALTER TABLE "PaymentSettings" ADD CONSTRAINT "PaymentSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
