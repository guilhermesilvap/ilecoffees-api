ALTER TABLE "Course" ADD COLUMN "supplierId" TEXT;

ALTER TABLE "Course" ADD CONSTRAINT "Course_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
