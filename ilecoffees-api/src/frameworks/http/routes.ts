import { Router } from 'express'
import { upload } from '@/configs/multer'
import { requireAuth } from '@/middlewares/requireAuth'
import { requireAuthOrQuery } from '@/middlewares/requireAuthOrQuery'
import { optionalAuth } from '@/middlewares/optionalAuth'
import { requireAdmin } from '@/middlewares/requireAdmin'
import { requireSupplier } from '@/middlewares/requireSupplier'
import { requireRoaster } from '@/middlewares/requireRoaster'
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
import { MelhorEnvioShippingService } from '@/adapters/services/melhor-envio-shipping-service'
import { PrismaSupplierPlansRepository } from '@/adapters/repositories/prisma-supplier-plans-repository'
import { PrismaDashboardRepository } from '@/adapters/repositories/prisma-dashboard-repository'
import { PrismaCourseLessonProgressRepository } from '@/adapters/repositories/prisma-course-lesson-progress-repository'
import { PrismaReviewsRepository } from '@/adapters/repositories/prisma-reviews-repository'
import { PrismaStockMovementsRepository } from '@/adapters/repositories/prisma-stock-movements-repository'
import { PrismaNotificationsRepository } from '@/adapters/repositories/prisma-notifications-repository'
import { PrismaCoffeeshopStockRepository } from '@/adapters/repositories/prisma-coffeeshop-stock-repository'
import { PrismaFavoritesRepository } from '@/adapters/repositories/prisma-favorites-repository'
import { PrismaSubscriptionDeliveriesRepository } from '@/adapters/repositories/prisma-subscription-deliveries-repository'

// Use Cases
import { CreateCoffeeUseCase } from '@/use-cases/create-coffee'
import { UpdateCoffeeUseCase } from '@/use-cases/update-coffee'
import { DeleteCoffeeUseCase } from '@/use-cases/delete-coffee'
import { ListCoffeesUseCase } from '@/use-cases/list-coffees'
import { GetCoffeeUseCase } from '@/use-cases/get-coffee'
import { CreateUserUseCase } from '@/use-cases/create-user'
import { UpdateUserUseCase } from '@/use-cases/update-user'
import { CreateSupplierUseCase } from '@/use-cases/create-supplier'
import { UpdateSupplierUseCase } from '@/use-cases/update-supplier'
import { CreateSessionUseCase } from '@/use-cases/create-session'
import { RefreshSessionUseCase } from '@/use-cases/refresh-session'
import { CreateSubscriptionUseCase } from '@/use-cases/create-subscription'
import { UpdateSubscriptionUseCase } from '@/use-cases/update-subscription'
import { DeleteSubscriptionUseCase } from '@/use-cases/delete-subscription'
import { ListSubscriptionsUseCase } from '@/use-cases/list-subscriptions'
import { GetSubscriptionUseCase } from '@/use-cases/get-subscription'
import { CreateAdminUseCase } from '@/use-cases/create-admin'
import { ListUsersUseCase } from '@/use-cases/list-users'
import { DeleteUserUseCase } from '@/use-cases/delete-user'
import { ListSuppliersUseCase } from '@/use-cases/list-suppliers'
import { DeleteSupplierUseCase } from '@/use-cases/delete-supplier'
import { AddToCartUseCase } from '@/use-cases/add-to-cart'
import { RemoveFromCartUseCase } from '@/use-cases/remove-from-cart'
import { ListCartUseCase } from '@/use-cases/list-cart'
import { UpdateCartItemUseCase } from '@/use-cases/update-cart-item'
import { CreateOrderUseCase } from '@/use-cases/create-order'
import { ListOrdersUseCase } from '@/use-cases/list-orders'
import { ListSupplierOrdersUseCase } from '@/use-cases/list-supplier-orders'
import { CancelOrderUseCase } from '@/use-cases/cancel-order'
import { GetOrderUseCase } from '@/use-cases/get-order'
import { CreateSubscriptionOrderUseCase } from '@/use-cases/create-subscription-order'
import { ListAllOrdersUseCase } from '@/use-cases/list-all-orders'
import { UpdateOrderStatusUseCase } from '@/use-cases/update-order-status'
import { SetupAdminUseCase } from '@/use-cases/setup-admin'
import { adminCreateSchema } from '@/adapters/validators/admin-schema'
import { ConnectMpAccountUseCase } from '@/use-cases/connect-mp-account'
import { DisconnectMpAccountUseCase } from '@/use-cases/disconnect-mp-account'
import { CreateB2BOrderUseCase } from '@/use-cases/create-b2b-order'
import { CreatePaymentUseCase } from '@/use-cases/create-payment'
import { ListPaymentsUseCase } from '@/use-cases/list-payments'
import { GetPaymentStatusUseCase } from '@/use-cases/get-payment-status'
import { FulfillApprovedOrderUseCase } from '@/use-cases/fulfill-approved-order'
import { ProcessPaymentWebhookUseCase } from '@/use-cases/process-payment-webhook'
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
import { CalculateShippingUseCase } from '@/use-cases/calculate-shipping'
import { EstimateProductShippingUseCase } from '@/use-cases/estimate-product-shipping'
import { CreateSupplierPlanUseCase } from '@/use-cases/create-supplier-plan'
import { UpdateSupplierPlanUseCase } from '@/use-cases/update-supplier-plan'
import { DeleteSupplierPlanUseCase } from '@/use-cases/delete-supplier-plan'
import { ListSupplierPlansUseCase } from '@/use-cases/list-supplier-plans'
import { ToggleSupplierStatusUseCase } from '@/use-cases/toggle-supplier-status'
import { AssignSupplierPlanUseCase } from '@/use-cases/assign-supplier-plan'
import { GetDashboardUseCase } from '@/use-cases/get-dashboard'
import { GetRevenueByPeriodUseCase } from '@/use-cases/get-revenue-by-period'
import { ListCourseEnrollmentsUseCase } from '@/use-cases/list-course-enrollments'
import { MarkLessonCompleteUseCase } from '@/use-cases/mark-lesson-complete'
import { GetCourseProgressUseCase } from '@/use-cases/get-course-progress'
import { CreateReviewUseCase } from '@/use-cases/create-review'
import { ListReviewsUseCase } from '@/use-cases/list-reviews'
import { AdjustStockUseCase } from '@/use-cases/adjust-stock'
import { ListStockMovementsUseCase } from '@/use-cases/list-stock-movements'
import { ListCoffeeshopStockUseCase } from '@/use-cases/list-coffeeshop-stock'
import { UpsertCoffeeshopStockUseCase } from '@/use-cases/upsert-coffeeshop-stock'
import { NotifyLowStockUseCase } from '@/use-cases/notify-low-stock'
import { NotificationService } from '@/services/notification-service'
import { SseChannel } from '@/services/channels/sse-channel'
import { EmailChannel } from '@/services/channels/email-channel'
import { TrackOrderUseCase } from '@/use-cases/track-order'
import { PauseSubscriptionUseCase } from '@/use-cases/pause-subscription'
import { ResumeSubscriptionUseCase } from '@/use-cases/resume-subscription'
import { ListSubscriptionDeliveriesUseCase } from '@/use-cases/list-subscription-deliveries'
import { AddFavoriteUseCase } from '@/use-cases/add-favorite'
import { RemoveFavoriteUseCase } from '@/use-cases/remove-favorite'
import { ListFavoritesUseCase } from '@/use-cases/list-favorites'
import { GetPartnerStockUseCase } from '@/use-cases/get-partner-stock'
import { GetCoffeeshopStockForSupplierUseCase } from '@/use-cases/get-coffeeshop-stock-for-supplier'
import { GetCourseStudentsProgressUseCase } from '@/use-cases/get-course-students-progress'
import { PrismaPartnerStockRepository } from '@/adapters/repositories/prisma-partner-stock-repository'
import { CreateEmployeeUseCase } from '@/use-cases/create-employee'
import { ListEmployeesUseCase } from '@/use-cases/list-employees'
import { DeleteEmployeeUseCase } from '@/use-cases/delete-employee'
import { PrismaEmployeesRepository } from '@/adapters/repositories/prisma-employees-repository'
import { EmployeesController } from '@/adapters/controllers/employees-controller'
import { requireEmployee } from '@/middlewares/requireEmployee'
import { ForgotPasswordUseCase } from '@/use-cases/forgot-password'
import { ResetPasswordUseCase } from '@/use-cases/reset-password'
import { MailService } from '@/services/mail-service'

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
import { ShippingController } from '@/adapters/controllers/shipping-controller'
import { ReviewsController } from '@/adapters/controllers/reviews-controller'
import { StockController } from '@/adapters/controllers/stock-controller'
import { NotificationsController } from '@/adapters/controllers/notifications-controller'
import { CoffeeshopStockController } from '@/adapters/controllers/coffeeshop-stock-controller'
import { FavoritesController } from '@/adapters/controllers/favorites-controller'
import { PasswordResetController } from '@/adapters/controllers/password-reset-controller'

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
const shippingService = new MelhorEnvioShippingService()
const supplierPlansRepo = new PrismaSupplierPlansRepository(prisma)
const dashboardRepo = new PrismaDashboardRepository(prisma)
const progressRepo = new PrismaCourseLessonProgressRepository(prisma)
const reviewsRepo = new PrismaReviewsRepository(prisma)
const stockMovementsRepo = new PrismaStockMovementsRepository(prisma)
const notificationsRepo = new PrismaNotificationsRepository(prisma)
const favoritesRepo = new PrismaFavoritesRepository(prisma)
const subscriptionDeliveriesRepo = new PrismaSubscriptionDeliveriesRepository(prisma)

const notificationService = new NotificationService(notificationsRepo, [
  new SseChannel(),
  new EmailChannel(),
])

const mailService = new MailService()

const deleteCoffeeUseCase = new DeleteCoffeeUseCase(coffeesRepo, suppliersRepo)
const deleteSupplierUseCase = new DeleteSupplierUseCase(suppliersRepo, coffeesRepo)
const deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(subscriptionsRepo)
const deleteCourseUseCase = new DeleteCourseUseCase(coursesRepo)

const coffeesController = new CoffeesController(
  new CreateCoffeeUseCase(coffeesRepo, suppliersRepo),
  new UpdateCoffeeUseCase(coffeesRepo, suppliersRepo),
  deleteCoffeeUseCase,
  new ListCoffeesUseCase(coffeesRepo),
  new GetCoffeeUseCase(coffeesRepo),
)

const usersController = new UsersController(
  new CreateUserUseCase(usersRepo, suppliersRepo, mailService),
  new UpdateUserUseCase(usersRepo),
)

const suppliersController = new SuppliersController(
  new CreateSupplierUseCase(suppliersRepo, usersRepo, mailService),
  new UpdateSupplierUseCase(suppliersRepo),
  suppliersRepo,
  new ConnectMpAccountUseCase(suppliersRepo),
  new DisconnectMpAccountUseCase(suppliersRepo),
)

const employeesRepo = new PrismaEmployeesRepository(prisma)

const sessionsController = new SessionsController(
  new CreateSessionUseCase(usersRepo, suppliersRepo, adminsRepo, employeesRepo),
  new RefreshSessionUseCase(),
)

const employeesController = new EmployeesController(
  new CreateEmployeeUseCase(employeesRepo),
  new ListEmployeesUseCase(employeesRepo),
  new DeleteEmployeeUseCase(employeesRepo),
  employeesRepo,
)

const subscriptionsController = new SubscriptionsController(
  new CreateSubscriptionUseCase(subscriptionsRepo, coffeesRepo, suppliersRepo),
  new UpdateSubscriptionUseCase(subscriptionsRepo, coffeesRepo),
  deleteSubscriptionUseCase,
  new ListSubscriptionsUseCase(subscriptionsRepo),
  new GetSubscriptionUseCase(subscriptionsRepo),
)

const adminsController = new AdminsController(
  new CreateAdminUseCase(adminsRepo),
  new ListUsersUseCase(usersRepo),
  new DeleteUserUseCase(usersRepo),
  new ListSuppliersUseCase(suppliersRepo),
  deleteSupplierUseCase,
  deleteCoffeeUseCase,
  deleteSubscriptionUseCase,
  new ListAllOrdersUseCase(ordersRepo),
  new UpdateOrderStatusUseCase(ordersRepo, notificationService),
  new CreateSupplierPlanUseCase(supplierPlansRepo),
  new UpdateSupplierPlanUseCase(supplierPlansRepo),
  new DeleteSupplierPlanUseCase(supplierPlansRepo, suppliersRepo),
  new ListSupplierPlansUseCase(supplierPlansRepo),
  new ToggleSupplierStatusUseCase(suppliersRepo),
  new AssignSupplierPlanUseCase(suppliersRepo, supplierPlansRepo),
  new GetDashboardUseCase(dashboardRepo),
  new GetRevenueByPeriodUseCase(dashboardRepo),
  new GetPartnerStockUseCase(new PrismaPartnerStockRepository(prisma)),
)

const cartController = new CartController(
  new AddToCartUseCase(cartItemsRepo, coffeesRepo),
  new RemoveFromCartUseCase(cartItemsRepo),
  new ListCartUseCase(cartItemsRepo),
  new UpdateCartItemUseCase(cartItemsRepo, coffeesRepo),
)

const passwordResetController = new PasswordResetController(
  new ForgotPasswordUseCase(usersRepo, suppliersRepo, mailService),
  new ResetPasswordUseCase(usersRepo, suppliersRepo),
)

const ordersController = new OrdersController(
  new CreateOrderUseCase(cartItemsRepo, coffeesRepo, ordersRepo, usersRepo, notificationService),
  new ListOrdersUseCase(ordersRepo),
  new ListSupplierOrdersUseCase(ordersRepo),
  new CancelOrderUseCase(ordersRepo),
  new GetOrderUseCase(ordersRepo),
  new CreateSubscriptionOrderUseCase(subscriptionsRepo, ordersRepo),
  new TrackOrderUseCase(ordersRepo),
  new PauseSubscriptionUseCase(ordersRepo),
  new ResumeSubscriptionUseCase(ordersRepo),
  new ListSubscriptionDeliveriesUseCase(ordersRepo, subscriptionDeliveriesRepo),
  new CreateB2BOrderUseCase(cartItemsRepo, coffeesRepo, ordersRepo, suppliersRepo),
  ordersRepo,
)

const favoritesController = new FavoritesController(
  new AddFavoriteUseCase(favoritesRepo, coffeesRepo),
  new RemoveFavoriteUseCase(favoritesRepo),
  new ListFavoritesUseCase(favoritesRepo),
)

const shippingController = new ShippingController(
  new CalculateShippingUseCase(cartItemsRepo, coffeesRepo, suppliersRepo, shippingService),
  new EstimateProductShippingUseCase(coffeesRepo, suppliersRepo, shippingService),
)

const coffeeshopStockRepo = new PrismaCoffeeshopStockRepository(prisma)

const fulfillApprovedOrderUseCase = new FulfillApprovedOrderUseCase(
  coffeesRepo, courseEnrollmentsRepo, cartItemsRepo, stockMovementsRepo, notificationService,
  coffeeshopStockRepo, subscriptionsRepo, subscriptionDeliveriesRepo,
)

const paymentsController = new PaymentsController(
  new CreatePaymentUseCase(paymentsRepo, ordersRepo, suppliersRepo, fulfillApprovedOrderUseCase),
  new ListPaymentsUseCase(paymentsRepo),
  new GetPaymentStatusUseCase(paymentsRepo, ordersRepo, fulfillApprovedOrderUseCase),
  new ProcessPaymentWebhookUseCase(paymentsRepo, ordersRepo, fulfillApprovedOrderUseCase),
)

const stockController = new StockController(
  new AdjustStockUseCase(coffeesRepo, stockMovementsRepo),
  new ListStockMovementsUseCase(stockMovementsRepo, coffeesRepo),
  coffeesRepo,
  new GetCoffeeshopStockForSupplierUseCase(coffeeshopStockRepo),
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
  new ListEnrolledCoursesUseCase(courseEnrollmentsRepo, progressRepo, coursesRepo),
  new ListCourseEnrollmentsUseCase(courseEnrollmentsRepo, coursesRepo),
  new MarkLessonCompleteUseCase(progressRepo, courseEnrollmentsRepo, coursesRepo, courseLessonsRepo),
  new GetCourseProgressUseCase(progressRepo, courseEnrollmentsRepo, coursesRepo),
  new GetCourseStudentsProgressUseCase(coursesRepo, courseEnrollmentsRepo, courseLessonsRepo, progressRepo),
)

const reviewsController = new ReviewsController(
  new CreateReviewUseCase(reviewsRepo, coffeesRepo, coursesRepo, courseEnrollmentsRepo),
  new ListReviewsUseCase(reviewsRepo),
)

const notificationsController = new NotificationsController(notificationsRepo)

const notifyLowStockUseCase = new NotifyLowStockUseCase(coffeeshopStockRepo, coffeesRepo, usersRepo, suppliersRepo, notificationService)

const coffeeshopStockController = new CoffeeshopStockController(
  new ListCoffeeshopStockUseCase(coffeeshopStockRepo),
  new UpsertCoffeeshopStockUseCase(coffeeshopStockRepo, notifyLowStockUseCase),
  notifyLowStockUseCase,
)

// --- Routes ---

const routes = Router()

// SSE — usa requireAuthOrQuery para aceitar token via query string (EventSource não suporta headers)
routes.get('/notifications/stream', requireAuthOrQuery, notificationsController.stream)

// Setup inicial — só funciona se não houver nenhum admin cadastrado
routes.post('/setup-admin', async (req, res) => {
  const input = adminCreateSchema.parse(req.body)
  const useCase = new SetupAdminUseCase(adminsRepo)
  const admin = await useCase.execute(input)
  res.status(201).json({ id: admin.id, name: admin.name, email: admin.email })
})

// Public
routes.get('/suppliers', suppliersController.listPublic)
routes.post('/users', upload.single('photo'), usersController.create)
routes.post('/suppliers', upload.single('photo'), suppliersController.create)
routes.post('/sessions', sessionsController.create)
routes.post('/sessions/refresh', sessionsController.refresh)
routes.post('/forgot-password', passwordResetController.forgot)
routes.post('/reset-password', passwordResetController.reset)
routes.get('/coffees', optionalAuth, coffeesController.index)
routes.get('/coffees/:id', optionalAuth, coffeesController.show)
routes.get('/subscriptions', optionalAuth, subscriptionsController.index)
routes.get('/subscriptions/:id', optionalAuth, subscriptionsController.show)
routes.get('/orders/:id/track', ordersController.track)
routes.get('/shipping/estimate-product', shippingController.estimateProduct)
routes.get('/courses', optionalAuth, coursesController.index)
routes.get('/courses/my-enrollments', requireAuth, coursesController.myEnrollments)
routes.get('/courses/:id', optionalAuth, coursesController.show)

// Protected (User / Supplier / Admin)
routes.use(requireAuth)

routes.put('/users/profile', upload.single('photo'), usersController.update)

routes.put('/suppliers/profile', upload.single('photo'), suppliersController.update)

routes.post('/coffees', upload.single('photo'), coffeesController.create)
routes.put('/coffees/:id', upload.single('photo'), coffeesController.update)
routes.delete('/coffees/:id', coffeesController.delete)

routes.post('/subscriptions', subscriptionsController.create)
routes.put('/subscriptions/:id', subscriptionsController.update)
routes.delete('/subscriptions/:id', subscriptionsController.delete)

routes.get('/cart', cartController.index)
routes.post('/cart/items', cartController.add)
routes.patch('/cart/items/:coffeeId', cartController.update)
routes.delete('/cart/items/:coffeeId', cartController.remove)

routes.get('/orders', ordersController.index)
routes.post('/orders', ordersController.create)
routes.post('/orders/subscribe', ordersController.subscribe)
routes.get('/orders/:id', ordersController.show)
routes.patch('/orders/:id/cancel', ordersController.cancel)
routes.patch('/orders/:id/pause', ordersController.pause)
routes.patch('/orders/:id/resume', ordersController.resume)
routes.get('/orders/:id/deliveries', ordersController.deliveries)

routes.get('/favorites', favoritesController.index)
routes.post('/favorites', favoritesController.add)
routes.delete('/favorites/:coffeeId', favoritesController.remove)

routes.get('/shipping/estimate', shippingController.estimate)

routes.get('/payments', paymentsController.index)
routes.post('/payments', paymentsController.create)
routes.get('/payments/status/:orderId', paymentsController.status)
routes.post('/payments/webhook/mercadopago', paymentsController.webhook)

routes.get('/notifications', notificationsController.index)
routes.patch('/notifications/read-all', notificationsController.markAllRead)
routes.patch('/notifications/:id/read', notificationsController.markRead)

// Courses (auth required for user-specific actions)
routes.get('/courses/:id/progress', coursesController.getProgress)
routes.post('/courses/:id/enroll', coursesController.enroll)
routes.patch('/courses/:id/lessons/:lessonId/complete', coursesController.completeLesson)
routes.get('/courses/:id/reviews', reviewsController.listForCourse)
routes.post('/courses/:id/reviews', reviewsController.createForCourse)
routes.get('/coffees/:id/reviews', reviewsController.listForCoffee)
routes.post('/coffees/:id/reviews', reviewsController.createForCoffee)

// Supplier plans (public authenticated)
routes.get('/supplier-plans', adminsController.listSupplierPlans)

const isSupplier = requireSupplier(suppliersRepo)
const isRoaster = requireRoaster(suppliersRepo)

// Supplier: B2B purchases (ROASTER buying from PRODUCER)
routes.post('/supplier/b2b/orders', isSupplier, ordersController.supplierB2BCreate)
routes.get('/supplier/b2b/orders', isSupplier, ordersController.supplierB2BIndex)

// Supplier: Mercado Pago OAuth
routes.get('/supplier/mp/auth-url', isSupplier, suppliersController.mpAuthUrl)
routes.post('/supplier/mp/connect', isSupplier, suppliersController.mpConnect)
routes.delete('/supplier/mp/connect', isSupplier, suppliersController.mpDisconnect)
routes.get('/supplier/mp/status', isSupplier, suppliersController.mpStatus)

// Supplier: orders for own products
routes.get('/supplier/orders', isSupplier, ordersController.supplierIndex)

// Stock management (Supplier only)
routes.get('/supplier/stock', isSupplier, stockController.overview)
routes.get('/supplier/stock/movements', isSupplier, stockController.movements)
routes.post('/coffees/:id/stock/adjust', isSupplier, stockController.adjust)
routes.get('/supplier/coffeeshop-stock', isSupplier, stockController.coffeeshopOverview)

// Roaster: manage own courses (Producer does not offer courses)
routes.get('/supplier/courses', isRoaster, coursesController.supplierIndex)
routes.post('/supplier/courses', isRoaster, upload.single('photo'), coursesController.supplierCreate)
routes.put('/supplier/courses/:id', isRoaster, upload.single('photo'), coursesController.supplierUpdate)
routes.delete('/supplier/courses/:id', isRoaster, coursesController.supplierDelete)
routes.post('/supplier/courses/:id/lessons', isRoaster, coursesController.supplierCreateLesson)
routes.put('/supplier/courses/:id/lessons/:lessonId', isRoaster, coursesController.supplierUpdateLesson)
routes.delete('/supplier/courses/:id/lessons/:lessonId', isRoaster, coursesController.supplierDeleteLesson)
routes.get('/supplier/courses/:id/students', isRoaster, coursesController.supplierListStudentsProgress)

// CoffeeShop: stock management
routes.get('/coffeeshop/stock', coffeeshopStockController.list)
routes.put('/coffeeshop/stock/:coffeeId', coffeeshopStockController.upsert)
routes.post('/coffeeshop/stock/:coffeeId/notify', coffeeshopStockController.notify)

// CoffeeShop: employee management
routes.get('/coffeeshop/employees', employeesController.index)
routes.post('/coffeeshop/employees', employeesController.create)
routes.delete('/coffeeshop/employees/:id', employeesController.delete)

// Employee: access coffeeshop stock via their coffeeshopId
routes.get('/employee/stock', requireEmployee, (req, res) => {
  req.user.id = req.user.coffeeshopId!
  return coffeeshopStockController.list(req, res)
})
routes.put('/employee/stock/:coffeeId', requireEmployee, async (req, res, next) => {
  try {
    const employeeId = req.user.id
    const coffeeshopId = req.user.coffeeshopId!
    const { coffeeId } = req.params

    const current = await coffeeshopStockRepo.findByUserAndCoffee(coffeeshopId, coffeeId)
    const previousQty = current?.quantity ?? 0

    req.user.id = coffeeshopId
    await coffeeshopStockController.upsert(req, res)

    if (typeof req.body.quantity === 'number') {
      await employeesRepo.logStockChange({
        employeeId,
        coffeeId,
        coffeeName: current?.coffee?.name ?? coffeeId,
        previousQty,
        newQty: req.body.quantity,
      })
    }
  } catch (err) {
    next(err)
  }
})

// Employee: track course view
routes.post('/employee/courses/:courseId/view', requireEmployee, async (req, res, next) => {
  try {
    const { courseName = '' } = req.body
    const course = await coursesRepo.findById(req.params.courseId)
    await employeesRepo.upsertCourseView({
      employeeId: req.user.id,
      courseId: req.params.courseId,
      courseName: course?.title ?? courseName,
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// Admin only
routes.use('/admin', requireAdmin)

routes.post('/admin', adminsController.createAdmin)
routes.get('/admin/users', adminsController.listUsers)
routes.delete('/admin/users/:id', adminsController.deleteUser)
routes.get('/admin/suppliers', adminsController.listSuppliers)
routes.delete('/admin/suppliers/:id', adminsController.deleteSupplier)
routes.patch('/admin/suppliers/:id/status', adminsController.toggleSupplierStatus)
routes.patch('/admin/suppliers/:id/plan', adminsController.assignSupplierPlan)
routes.delete('/admin/coffees/:id', adminsController.deleteCoffee)
routes.delete('/admin/subscriptions/:id', adminsController.deleteSubscription)
routes.get('/admin/dashboard', adminsController.getDashboard)
routes.get('/admin/dashboard/revenue', adminsController.getRevenueByPeriod)
routes.get('/admin/orders', adminsController.listOrders)
routes.patch('/admin/orders/:id/status', adminsController.updateOrderStatus)
routes.get('/admin/supplier-plans', adminsController.listSupplierPlans)
routes.post('/admin/supplier-plans', adminsController.createSupplierPlan)
routes.put('/admin/supplier-plans/:id', adminsController.updateSupplierPlan)
routes.delete('/admin/supplier-plans/:id', adminsController.deleteSupplierPlan)

routes.get('/admin/partner-stock', adminsController.getPartnerStock)

routes.post('/admin/courses', upload.single('photo'), coursesController.create)
routes.put('/admin/courses/:id', upload.single('photo'), coursesController.update)
routes.delete('/admin/courses/:id', coursesController.delete)
routes.get('/admin/courses/:id/enrollments', coursesController.listEnrollments)
routes.get('/admin/courses/:id/students', coursesController.listStudentsProgress)
routes.post('/admin/courses/:id/lessons', coursesController.createLesson)
routes.put('/admin/courses/:id/lessons/:lessonId', coursesController.updateLesson)
routes.delete('/admin/courses/:id/lessons/:lessonId', coursesController.deleteLesson)

export { routes }
