-- CreateEnum
CREATE TYPE "BillingTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "BillingTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "providerReference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BillingTransactionStatus" NOT NULL,
    "description" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingTransaction_providerTransactionId_key" ON "BillingTransaction"("providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingTransaction_providerReference_key" ON "BillingTransaction"("providerReference");

-- CreateIndex
CREATE INDEX "BillingTransaction_userId_idx" ON "BillingTransaction"("userId");

-- CreateIndex
CREATE INDEX "BillingTransaction_subscriptionId_idx" ON "BillingTransaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingTransaction_status_idx" ON "BillingTransaction"("status");

-- CreateIndex
CREATE INDEX "BillingTransaction_createdAt_idx" ON "BillingTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "BillingTransaction" ADD CONSTRAINT "BillingTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingTransaction" ADD CONSTRAINT "BillingTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
