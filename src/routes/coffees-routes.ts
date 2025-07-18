import { Router } from "express";
import { CoffeesControllers } from "@/controllers/coffees-controller";

const coffeesRoutes = Router()
const coffeesControllers = new CoffeesControllers()

coffeesRoutes.get("/", coffeesControllers.index)
coffeesRoutes.post("/", coffeesControllers.create)
coffeesRoutes.delete("/:id", coffeesControllers.delete)
coffeesRoutes.put("/:id", coffeesControllers.update)


export {coffeesRoutes}