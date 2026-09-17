-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'CLAIMED');

-- AlterTable
ALTER TABLE "RewardRedemption" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING';
