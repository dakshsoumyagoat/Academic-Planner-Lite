import { Router } from "express";
import { db, tasksTable, testsTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
  const today = new Date().toISOString().split("T")[0];

  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

  const [todayTasks, weekTasks, allUpcomingTests] = await Promise.all([
    db.select().from(tasksTable).where(and(eq(tasksTable.userId, userId), eq(tasksTable.dueDate, today))).orderBy(tasksTable.priority),
    db.select().from(tasksTable).where(and(eq(tasksTable.userId, userId), gte(tasksTable.dueDate, today), lte(tasksTable.dueDate, endOfWeekStr))).orderBy(tasksTable.dueDate),
    db.select().from(testsTable).where(and(eq(testsTable.userId, userId), gte(testsTable.date, today))).orderBy(testsTable.date),
  ]);

  const upcomingTests = allUpcomingTests.slice(0, 5);

  const [settings] = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId));
  const jeeMainDate = settings?.jeeMainDate ?? "2027-01-22";
  const jeeAdvancedDate = settings?.jeeAdvancedDate ?? "2027-05-18";

  const todayMs = new Date(today).getTime();
  const jeeMainMs = new Date(jeeMainDate).getTime();
  const jeeAdvancedMs = new Date(jeeAdvancedDate).getTime();

  const daysToJeeMain = Math.ceil((jeeMainMs - todayMs) / (1000 * 60 * 60 * 24));
  const daysToJeeAdvanced = Math.ceil((jeeAdvancedMs - todayMs) / (1000 * 60 * 60 * 24));

  res.json({
    todayTasks,
    upcomingTests,
    weekTasks,
    daysToJeeMain: daysToJeeMain > 0 ? daysToJeeMain : null,
    daysToJeeAdvanced: daysToJeeAdvanced > 0 ? daysToJeeAdvanced : null,
    todayDate: today,
  });
});

export default router;
