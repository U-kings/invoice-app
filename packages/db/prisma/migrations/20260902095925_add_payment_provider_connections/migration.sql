-- CreateEnum
CREATE TYPE "PaymentConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateTable
CREATE TABLE "PaymentProviderConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "providerAccountId" TEXT,
    "providerMerchantId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProviderConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentProviderConnection_provider_idx" ON "PaymentProviderConnection"("provider");

-- CreateIndex
CREATE INDEX "PaymentProviderConnection_providerAccountId_idx" ON "PaymentProviderConnection"("providerAccountId");

-- CreateIndex
CREATE INDEX "PaymentProviderConnection_providerMerchantId_idx" ON "PaymentProviderConnection"("providerMerchantId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProviderConnection_userId_provider_key" ON "PaymentProviderConnection"("userId", "provider");

-- AddForeignKey
ALTER TABLE "PaymentProviderConnection" ADD CONSTRAINT "PaymentProviderConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
