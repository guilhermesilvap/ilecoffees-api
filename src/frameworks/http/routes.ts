import { Router } from 'express'
import { upload } from '@/configs/multer'
import { requireAuth } from '@/middlewares/requireAuth'
import { requireAdmin } from '@/middlewares/requireAdmin'
import { prisma } from '@/frameworks/database/prisma'

// Repositories
import { PrismaCoffeesRepository } from '@/adapters/repositories/prisma-coffees-repository'
import { PrismaUsersRepository } from '@/adapters/repositories/prisma-users-repository'
import { PrismaSuppliersRepository } from '@/adapters/repositories/prisma-suppliers-repository'
import { PrismaSubscriptionsRepository } from '@/adapters/repositories/prisma-subscriptions-repository'
import { PrismaAdminsRepository } from '@/adapters/repositories/prisma-admins-repository'
import { PrismaCartItemsRepository } from '@/adapters/repositories/prisma-cart-items-repository'
import { PrismaOrdersRepository } from '@/adapters/repositories/prisma-orders-repository'
import { PrismaPaymentsRepository } from '@/adapters/repositories/prisma-payments-repository'
import { PrismaCoursesRepository } from '@/adapters/repositories/prisma-courses-repository'
import { PrismaCourseLessonsRepository } from '@/adapters/repositories/prisma-course-lessons-repository'
import { PrismaCourseEnrollmentsRepository } from '@/adapters/repositories/prisma-course-enrollments-repository'

// Use Cases
import { CreateCoffeeUseCase } from '@/use-cases/create-coffee'
import { UpdateCoffeeUseCase } from '@/use-cases/update-coffee'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { ListCoffeesUseCase } from '@/use-cases/list-coffees'
import { CreateUserUseCase } from '@/use-cases/create-user'
import { UpdateUserUseCase } from '@/use-cases/update-user'
import { CreateSupplierUseCase } from '@/use-cases/create-supplier'
import { UpdateSupplierUseCase } from '@/use-cases/update-supplier'
import { CreateSessionUseCase } from '@/use-cases/create-session'
import { CreateSubscriptionUseCase } from '@/use-cases/create-subscription'
import { UpdateSubscriptionUseCase } from '@/use-cases/update-subscription'
import { DeleteSubscriptionUseCase } from '@/use-cases/delete-subscription'
import { ListSubscriptionsUseCase } from '@/use-cases/list-subscriptions'
import { CreateAdminUseCase } from '@/use-cases/create-admin'
import { ListUsersUseCase } from '@/use-cases/list-users'
import { DeleteUserUseCase } from '@/use-cases/delete-user'
import { ListSuppliersUseCase } from '@/use-cases/list-suppliers'
import { DeleteSupplierUseCase } from '@/use-cases/delete-supplier'
import { AddToCartUseCase } from '@/use-cases/add-to-cart'
import { RemoveFromCartUseCase } from '@/use-cases/remove-from-cart'
import { ListCartUseCase } from '@/use-cases/list-cart'
import { CreateOrderUseCase } from '@/use-cases/create-order'
import { ListOrdersUseCase } from '@/use-cases/list-orders'
import { CancelOrderUseCase } from '@/use-cases/cancel-order'
import { GetOrderUseCase } from '@/use-cases/get-order'
import { CreateSubscriptionOrderUseCase } from '@/use-cases/create-subscription-order'
import { ListAllOrdersUseCase } from '@/use-cases/list-all-orders'
import { UpdateOrderStatusUseCase } from '@/use-cases/update-order-status'
import { CreatePaymentUseCase } from '@/use-cases/create-payment'
import { ListPaymentsUseCase } from '@/use-cases/list-payments'
import { CreateCourseUseCase } from '@/use-cases/create-course'
import { UpdateCourseUseCase } from '@/use-cases/update-course'
import { DeleteCourseUseCase } from '@/use-cases/delete-course'
import { ListCoursesUseCase } from '@/use-cases/list-courses'
import { CreateCourseLessonUseCase } from '@/use-cases/create-course-lesson'
import { UpdateCourseLessonUseCase } from '@/use-cases/update-course-lesson'
import { DeleteCourseLessonUseCase } from '@/use-cases/delete-course-lesson'
import { GetCourseWithLessonsUseCase } from '@/use-cases/get-course-with-lessons'
import { EnrollInCourseUseCase } from '@/use-cases/enroll-in-course'
import { ListEnrolledCoursesUseCase } from '@/use-cases/list-enrolled-courses'

// Controllers
import { CoffeesController } from '@/adapters/controllers/coffees-controller'
import { UsersController } from '@/adapters/controllers/users-controller'
import { SuppliersController } from '@/adapters/controllers/suppliers-controller'
import { SessionsController } from '@/adapters/controllers/sessions-controller'
import { SubscriptionsController } from '@/adapters/controllers/subscriptions-controller'
import { AdminsController } from '@/adapters/controllers/admins-controller'
import { CartController } from '@/adapters/controllers/cart-controller'
import { OrdersController } from '@/adapters/controllers/orders-controller'
import { PaymentsController } from '@/adapters/controllers/payments-controller'
import { CoursesController } from '@/adapters/controllers/courses-controller'

// --- Wiring ---

const coffeesRepo = new PrismaCoffeesRepository(prisma)
const usersRepo = new PrismaUsersRepository(prisma)
const suppliersRepo = new PrismaSuppliersRepository(prisma)
const subscriptionsRepo = new PrismaSubscriptionsRepository(prisma)
const adminsRepo = new PrismaAdminsRepository(prisma)
const cartItemsRepo = new PrismaCartItemsRepository(prisma)
const ordersRepo = new PrismaOrdersRepository(prisma)
const paymentsRepo = new PrismaPaymentsRepository(prisma)
const coursesRepo = new PrismaCoursesRepository(prisma)
const courseLessonsRepo = new PrismaCourseLessonsRepository(prisma)
const courseEnrollmentsRepo = new PrismaCourseEnrollmentsRepository(prisma)

const deleteCoffeeUseCase = new DeleteCoffeeUseCase(coffeesRepo)
const deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(subscriptionsRepo)
const deleteCourseUseCase = new DeleteCourseUseCase(coursesRepo)

const coffeesController = new CoffeesController(
  new CreateCoffeeUseCase(coffeesRepo),
  new UpdateCoffeeUseCase(coffeesRepo),
  deleteCoffeeUseCase,
  new ListCoffeesUseCase(coffeesRepo),
)

const usersController = new UsersController(
  new CreateUserUseCase(usersRepo, suppliersRepo),
  new UpdateUserUseCase(usersRepo),
)

const suppliersController = new SuppliersController(
  new CreateSupplierUseCase(suppliersRepo, usersRepo),
  new UpdateSupplierUseCase(suppliersRepo),
)

const sessionsController = new SessionsController(
  new CreateSessionUseCase(usersRepo, suppliersRepo, adminsRepo),
)

const subscriptionsController = new SubscriptionsController(
  new CreateSubscriptionUseCase(subscriptionsRepo, coffeesRepo),
  new UpdateSubscriptionUseCase(subscriptionsRepo, coffeesRepo),
  deleteSubscriptionUseCase,
  new ListSubscriptionsUseCase(subscriptionsRepo),
)

const adminsController = new AdminsController(
  new CreateAdminUseCase(adminsRepo),
  new ListUsersUseCase(usersRepo),
  new DeleteUserUseCase(usersRepo),
  new ListSuppliersUseCase(suppliersRepo),
  new DeleteSupplierUseCase(suppliersRepo),
  deleteCoffeeUseCase,
  deleteSubscriptionUseCase,
  new ListAllOrdersUseCase(ordersRepo),
  new UpdateOrderStatusUseCase(ordersRepo),
)

const cartController = new CartController(
  new AddToCartUseCase(cartItemsRepo, coffeesRepo),
  new RemoveFromCartUseCase(cartItemsRepo),
  new ListCartUseCase(cartItemsRepo),
)

const ordersController = new OrdersController(
  new CreateOrderUseCase(cartItemsRepo, coffeesRepo, ordersRepo),
  new ListOrdersUseCase(ordersRepo),
  new CancelOrderUseCase(ordersRepo),
  new GetOrderUseCase(ordersRepo),
  new CreateSubscriptionOrderUseCase(subscriptionsRepo, ordersRepo),
)

const paymentsController = new PaymentsController(
  new CreatePaymentUseCase(paymentsRepo, ordersRepo, coffeesRepo, courseEnrollmentsRepo),
  new ListPaymentsUseCase(paymentsRepo),
)

const coursesController = new CoursesController(
  new CreateCourseUseCase(coursesRepo),
  new UpdateCourseUseCase(coursesRepo),
  deleteCourseUseCase,
  new ListCoursesUseCase(coursesRepo),
  new CreateCourseLessonUseCase(courseLessonsRepo, coursesRepo),
  new UpdateCourseLessonUseCase(courseLessonsRepo),
  new DeleteCourseLessonUseCase(courseLessonsRepo),
  new GetCourseWithLessonsUseCase(coursesRepo, courseLessonsRepo, courseEnrollmentsRepo),
  new EnrollInCourseUseCase(coursesRepo, courseEnrollmentsRepo, ordersRepo),
  new ListEnrolledCoursesUseCase(courseEnrollmentsRepo),
)

// --- Routes ---

const routes = Router()

// Public
routes.post('/users', upload.single('photo'), usersController.create)
routes.post('/suppliers', upload.single('photo'), suppliersController.create)
routes.post('/sessions', sessionsController.create)

// Protected (User / Supplier / Admin)
routes.use(requireAuth)

routes.put('/users/profile', upload.single('photo'), usersController.update)

routes.put('/suppliers/profile', upload.single('photo'), suppliersController.update)

routes.get('/coffees', coffeesController.index)
routes.post('/coffees', upload.single('photo'), coffeesController.create)
routes.put('/coffees/:id', upload.single('photo'), coffeesController.update)
routes.delete('/coffees/:id', coffeesController.delete)

routes.get('/subscriptions', subscriptionsController.index)
routes.post('/subscriptions', subscriptionsController.create)
routes.put('/subscriptions/:id', subscriptionsController.update)
routes.delete('/subscriptions/:id', subscriptionsController.delete)

routes.get('/cart', cartController.index)
routes.post('/cart/items', cartController.add)
routes.delete('/cart/items/:coffeeId', cartController.remove)

routes.get('/orders', ordersController.index)
routes.post('/orders', ordersController.create)
routes.post('/orders/subscribe', ordersController.subscribe)
routes.get('/orders/:id', ordersController.show)
routes.patch('/orders/:id/cancel', ordersController.cancel)

routes.get('/payments', paymentsController.index)
routes.post('/payments', paymentsController.create)

// Courses (auth required)
routes.get('/courses', coursesController.index)
routes.get('/courses/my-enrollments', coursesController.myEnrollments)
routes.get('/courses/:id', coursesController.show)
routes.post('/courses/:id/enroll', coursesController.enroll)

// Admin only
routes.use('/admin', requireAdmin)

routes.post('/admin', adminsController.createAdmin)
routes.get('/admin/users', adminsController.listUsers)
routes.delete('/admin/users/:id', adminsController.deleteUser)
routes.get('/admin/suppliers', adminsController.listSuppliers)
routes.delete('/admin/suppliers/:id', adminsController.deleteSupplier)
routes.delete('/admin/coffees/:id', adminsController.deleteCoffee)
routes.delete('/admin/subscriptions/:id', adminsController.deleteSubscription)
routes.get('/admin/orders', adminsController.listOrders)
routes.patch('/admin/orders/:id/status', adminsController.updateOrderStatus)

routes.post('/admin/courses', upload.single('photo'), coursesController.create)
routes.put('/admin/courses/:id', upload.single('photo'), coursesController.update)
routes.delete('/admin/courses/:id', coursesController.delete)
routes.post('/admin/courses/:id/lessons', coursesController.createLesson)
routes.put('/admin/courses/:id/lessons/:lessonId', coursesController.updateLesson)
routes.delete('/admin/courses/:id/lessons/:lessonId', coursesController.deleteLesson)

export { routes }
