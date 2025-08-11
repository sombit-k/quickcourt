-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "bookings" ADD COLUMN "paymentIntentId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "bookings" ADD COLUMN "paymentUrl" TEXT;
ALTER TABLE "bookings" ADD COLUMN "refundAmount" REAL;
ALTER TABLE "bookings" ADD COLUMN "refundedAt" DATETIME;
