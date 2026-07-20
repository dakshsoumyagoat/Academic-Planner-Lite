import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import testsRouter from "./tests";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";
import holidaysRouter from "./holidays";
import monthlyGoalsRouter from "./monthly-goals";
import syllabusRouter from "./syllabus";
import { defaultUserMiddleware } from "../middlewares/default-user";

const router: IRouter = Router();

// Attach the single default user id to every request (no login required)
router.use(defaultUserMiddleware);

router.use(healthRouter);
router.use("/tasks", tasksRouter);
router.use("/tests", testsRouter);
router.use("/settings", settingsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/holidays", holidaysRouter);
router.use("/monthly-goals", monthlyGoalsRouter);
router.use("/syllabus", syllabusRouter);

export default router;
