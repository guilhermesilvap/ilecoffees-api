import { Router } from "express";
import { UsersRoutes } from "@/controllers/users-controller";

const usersRoutes = Router()
const usersRoutesController = new UsersRoutes()

usersRoutes.post("/", usersRoutesController.create)

export {usersRoutes}