-- AlterTable: make userId nullable and add supplierId to CartItem
ALTER TABLE "CartItem" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "CartItem" ADD COLUMN "supplierId" TEXT;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_supplierId_coffeeId_key" ON "CartItem"("supplierId", "coffeeId");
