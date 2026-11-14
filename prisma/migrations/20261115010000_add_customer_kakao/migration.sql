-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "kakaoId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_kakaoId_key" ON "Customer"("kakaoId");

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
