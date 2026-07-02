import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import testsRouter from "./tests";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";
import holidaysRouter from "./holidays";
import monthlyGoalsRouter from "./monthly-goals";
import syllabusRouter from "./syllabus";
import authRouter from "./auth";

const router: IRouter = Router();

router.use("/auth", authRouter);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Unauthorized" });
}

router.use(healthRouter);
router.use("/tasks", requireAuth, tasksRouter);
router.use("/tests", requireAuth, testsRouter);
router.use("/settings", requireAuth, settingsRouter);
router.use("/dashboard", requireAuth, dashboardRouter);
router.use("/holidays", requireAuth, holidaysRouter);
router.use("/monthly-goals", requireAuth, monthlyGoalsRouter);
router.use("/syllabus", requireAuth, syllabusRouter);

export default router;
