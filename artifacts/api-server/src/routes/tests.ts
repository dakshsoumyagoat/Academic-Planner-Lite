import { Router } from "express";
import { db, testsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListTestsQueryParams,
  CreateTestBody,
  UpdateTestBody,
  GetTestParams,
  UpdateTestParams,
  DeleteTestParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListTestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { search, upcoming } = parsed.data;

  const today = new Date().toISOString().split("T")[0];

  let tests = await db.select().from(testsTable).where(eq(testsTable.userId, req.session.userId!)).orderBy(testsTable.date);

  if (upcoming) {
    tests = tests.filter(t => t.date >= today);
  }
  if (search) {
    const s = search.toLowerCase();
    tests = tests.filter(t => t.name.toLowerCase().includes(s) || (t.notes && t.notes.toLowerCase().includes(s)));
  }

  res.json(tests);
});

router.post("/", async (req, res) => {
  const parsed = CreateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [test] = await db.insert(testsTable).values({ ...parsed.data, userId: req.session.userId! }).returning();
  res.status(201).json(test);
});

router.get("/:id", async (req, res) => {
  const parsed = GetTestParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [test] = await db.select().from(testsTable).where(and(eq(testsTable.id, parsed.data.id), eq(testsTable.userId, req.session.userId!)));
  if (!test) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(test);
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdateTestParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsedBody = UpdateTestBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [existing] = await db.select().from(testsTable).where(and(eq(testsTable.id, parsedParams.data.id), eq(testsTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db.update(testsTable).set(parsedBody.data).where(eq(testsTable.id, parsedParams.data.id)).returning();
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteTestParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db.select().from(testsTable).where(and(eq(testsTable.id, parsed.data.id), eq(testsTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(testsTable).where(eq(testsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
