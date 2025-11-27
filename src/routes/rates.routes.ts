import { Router } from "express"
import { RatesController } from "../controllers/rates/rates.controller"

const router = Router()
const ratesController = new RatesController()

// Public routes - no authentication required
router.get("/", ratesController.getAllRates)
router.get("/:cryptocurrency", ratesController.getRate)

// Admin route to manually trigger rate update
router.post("/update", ratesController.updateRates)

export default router
