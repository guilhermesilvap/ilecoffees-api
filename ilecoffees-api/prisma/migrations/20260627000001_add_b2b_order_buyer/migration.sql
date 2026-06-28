-- Make userId nullable (existing orders keep their userId)
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- Add buyerSupplierId for B2B orders (ROASTER buying from PRODUCER)
ALTER TABLE "Order" ADD COLUMN "buyerSupplierId" TEXT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerSupplierId_fkey"
  FOREIGN KEY ("buyerSupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
