-- Add SupplierType enum
CREATE TYPE "SupplierType" AS ENUM ('PRODUCER', 'ROASTER');

-- Add supplierType to Supplier (all existing suppliers become ROASTER)
ALTER TABLE "Supplier" ADD COLUMN "supplierType" "SupplierType" NOT NULL DEFAULT 'ROASTER';

-- Rename AccountType enum values
ALTER TYPE "AccountType" RENAME VALUE 'INDIVIDUAL' TO 'CUSTOMER';
ALTER TYPE "AccountType" RENAME VALUE 'COMPANY' TO 'COFFEESHOP';

-- Add BOTH to SaleType enum
ALTER TYPE "SaleType" ADD VALUE 'BOTH';

-- Add coffeeshop package price to Coffee
ALTER TABLE "Coffee" ADD COLUMN "packagePriceCoffeeshop" DOUBLE PRECISION;
