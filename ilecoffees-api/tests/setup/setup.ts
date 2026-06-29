import { prisma } from '../helpers/prisma'

beforeEach(async () => {
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "Admin", "User", "Supplier", "Coffee", "Subscription",
      "CartItem", "Order", "Payment", "Course", "CourseLesson",
      "CourseEnrollment", "_SubscriptionCoffees"
    CASCADE
  `
})
