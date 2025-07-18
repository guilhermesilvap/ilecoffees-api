import { SuppliersController } from "@/controllers/suppliers-controller";
import { Router } from "express";

const suppliersRoutes = Router() 
const suppliersController = new SuppliersController()

suppliersRoutes.post("/", suppliersController.create)

export {suppliersRoutes}