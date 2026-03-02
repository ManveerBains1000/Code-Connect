import express from "express"
import { protectRoute } from "../middlewares/protectRoute.js";
import { createSession, endSession, getActiveSessions, getRecentSessions, getSessionById, joinSession } from "../controllers/SessionControllers.js";

const router = express.Router();

router.post("/",protectRoute,createSession)
router.get("/active",protectRoute,getActiveSessions)
router.get("/my-recent",protectRoute,getRecentSessions)
router.get("/:id",protectRoute,getSessionById)
router.post("/:id/join",protectRoute,joinSession)
router.post("/:id/end",protectRoute,endSession)
export default router;