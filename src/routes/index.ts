import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { suppliersRoutes } from "./suppliers-routes";
import { sessionRoutes } from "./session-routes";
import { requireAuth } from "@/middlewares/requireAuth";
import { coffeesRoutes } from "./coffees-routes";
import { subscriptionsRoutes } from "./subscriptions-routes";

const routes = Router()

routes.use("/suppliers", suppliersRoutes)
routes.use("/users", usersRoutes)
routes.use("/sessions", sessionRoutes)

routes.use(requireAuth)
routes.use("/coffees", coffeesRoutes)
routes.use("/subscriptions", subscriptionsRoutes)
export {routes}