import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import testsRouter from "./tests";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";
import holidaysRouter from "./holidays";
import monthlyGoalsRouter from "./monthly-goals";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tasks", tasksRouter);
router.use("/tests", testsRouter);
router.use("/settings", settingsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/holidays", holidaysRouter);
router.use("/monthly-goals", monthlyGoalsRouter);

export default router;
