import { Router } from "express";
import { db, monthlyGoalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListMonthlyGoalsQueryParams,
  CreateMonthlyGoalBody,
  UpdateMonthlyGoalBody,
  UpdateMonthlyGoalParams,
  DeleteMonthlyGoalParams,
  ToggleMonthlyGoalParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListMonthlyGoalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { month, year } = parsed.data;
  const goals = await db
    .select()
    .from(monthlyGoalsTable)
    .where(and(eq(monthlyGoalsTable.userId, req.userId), eq(monthlyGoalsTable.month, month), eq(monthlyGoalsTable.year, year)))
    .orderBy(monthlyGoalsTable.createdAt);
  res.json(goals);
});

router.post("/", async (req, res) => {
  const parsed = CreateMonthlyGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [goal] = await db.insert(monthlyGoalsTable).values({
    ...parsed.data,
    userId: req.userId,
    subject: parsed.data.subject ?? "Custom",
    priority: parsed.data.priority ?? "medium",
  }).returning();
  res.status(201).json(goal);
});

router.patch("/:id/toggle", async (req, res) => {
  const parsed = ToggleMonthlyGoalParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db.select().from(monthlyGoalsTable).where(and(eq(monthlyGoalsTable.id, parsed.data.id), eq(monthlyGoalsTable.userId, req.userId)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(monthlyGoalsTable)
    .set({ completed: !existing.completed })
    .where(eq(monthlyGoalsTable.id, parsed.data.id))
    .returning();
  res.json(updated);
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdateMonthlyGoalParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsedBody = UpdateMonthlyGoalBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [existing] = await db.select().from(monthlyGoalsTable).where(and(eq(monthlyGoalsTable.id, parsedParams.data.id), eq(monthlyGoalsTable.userId, req.userId)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(monthlyGoalsTable)
    .set(parsedBody.data)
    .where(eq(monthlyGoalsTable.id, parsedParams.data.id))
    .returning();
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteMonthlyGoalParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db.select().from(monthlyGoalsTable).where(and(eq(monthlyGoalsTable.id, parsed.data.id), eq(monthlyGoalsTable.userId, req.userId)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(monthlyGoalsTable).where(eq(monthlyGoalsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
