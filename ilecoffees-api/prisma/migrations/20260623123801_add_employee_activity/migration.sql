-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "lastAccessAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EmployeeStockLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "coffeeId" TEXT NOT NULL,
    "coffeeName" TEXT NOT NULL,
    "previousQty" DOUBLE PRECISION NOT NULL,
    "newQty" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeStockLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCourseView" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeCourseView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCourseView_employeeId_courseId_key" ON "EmployeeCourseView"("employeeId", "courseId");

-- AddForeignKey
ALTER TABLE "EmployeeStockLog" ADD CONSTRAINT "EmployeeStockLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCourseView" ADD CONSTRAINT "EmployeeCourseView_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
