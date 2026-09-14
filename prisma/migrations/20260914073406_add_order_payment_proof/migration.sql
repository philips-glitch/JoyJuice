-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "pointsCredited" BOOLEAN NOT NULL DEFAULT false;
