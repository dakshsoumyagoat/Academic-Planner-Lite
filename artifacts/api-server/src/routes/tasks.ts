import { Router } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ToggleTaskParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { date, subject, completed, search } = parsed.data;

  const conditions = [eq(tasksTable.userId, req.session.userId!)];
  if (date) conditions.push(eq(tasksTable.dueDate, date));
  if (subject) conditions.push(eq(tasksTable.subject, subject));
  if (completed !== undefined) conditions.push(eq(tasksTable.completed, completed));
  if (search) {
    conditions.push(
      or(
        ilike(tasksTable.title, `%${search}%`),
        ilike(tasksTable.chapter, `%${search}%`),
        ilike(tasksTable.notes, `%${search}%`)
      )!
    );
  }

  const tasks = await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.dueDate);
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [task] = await db.insert(tasksTable).values({ ...parsed.data, userId: req.session.userId! }).returning();
  res.status(201).json(task);
});

router.get("/:id", async (req, res) => {
  const parsed = GetTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, parsed.data.id), eq(tasksTable.userId, req.session.userId!)));
  if (!task) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(task);
});

router.patch("/:id/toggle", async (req, res) => {
  const parsed = ToggleTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, parsed.data.id), eq(tasksTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db.update(tasksTable).set({ completed: !existing.completed }).where(eq(tasksTable.id, parsed.data.id)).returning();
  res.json(updated);
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdateTaskParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsedBody = UpdateTaskBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [existing] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, parsedParams.data.id), eq(tasksTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db.update(tasksTable).set(parsedBody.data).where(eq(tasksTable.id, parsedParams.data.id)).returning();
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, parsed.data.id), eq(tasksTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(tasksTable).where(eq(tasksTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
