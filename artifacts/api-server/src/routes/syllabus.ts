import { Router } from "express";
import { db, syllabusTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { UpdateSyllabusChapterBody, UpdateSyllabusChapterParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const chapters = await db
    .select()
    .from(syllabusTable)
    .where(eq(syllabusTable.userId, req.session.userId!))
    .orderBy(syllabusTable.id);
  res.json(chapters);
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdateSyllabusChapterParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsedBody = UpdateSyllabusChapterBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [existing] = await db
    .select()
    .from(syllabusTable)
    .where(and(eq(syllabusTable.id, parsedParams.data.id), eq(syllabusTable.userId, req.session.userId!)));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(syllabusTable)
    .set({ status: parsedBody.data.status, updatedAt: new Date() })
    .where(eq(syllabusTable.id, parsedParams.data.id))
    .returning();
  res.json(updated);
});

export default router;
