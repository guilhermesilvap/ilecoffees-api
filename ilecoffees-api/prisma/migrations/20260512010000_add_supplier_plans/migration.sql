-- CreateTable SupplierPlan
CREATE TABLE "SupplierPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "maxProducts" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierPlan_pkey" PRIMARY KEY ("id")
);

-- AddColumns to Supplier
ALTER TABLE "Supplier" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Supplier" ADD COLUMN "planId" TEXT;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SupplierPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
