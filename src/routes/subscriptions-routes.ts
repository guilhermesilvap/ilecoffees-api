import { Router } from "express";
import { SubscriptionControllers } from "@/controllers/subscriptions-controller";

const subscriptionsRoutes = Router()
const subscriptionsController = new SubscriptionControllers()

subscriptionsRoutes.post("/", subscriptionsController.create)
subscriptionsRoutes.get("/", subscriptionsController.index)
subscriptionsRoutes.delete("/:id", subscriptionsController.delete)

export { subscriptionsRoutes }