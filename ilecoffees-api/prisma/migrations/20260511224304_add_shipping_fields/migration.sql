-- AlterTable
ALTER TABLE "Coffee" ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "lengthCm" INTEGER,
ADD COLUMN     "weightGrams" INTEGER,
ADD COLUMN     "widthCm" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCep" TEXT,
ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "shippingCost" DOUBLE PRECISION,
ADD COLUMN     "shippingDeadlineDays" INTEGER;
