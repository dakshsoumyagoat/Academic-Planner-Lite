import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateSettings(userId: number) {
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(settingsTable).values({
    userId,
    theme: "dark",
    accentColor: "#4aff00",
    jeeMainDate: "2027-01-22",
    jeeAdvancedDate: "2027-05-18",
  }).returning();
  return created;
}

router.get("/", async (req, res) => {
  const settings = await getOrCreateSettings(req.session.userId!);
  res.json(settings);
});

router.patch("/", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const settings = await getOrCreateSettings(req.session.userId!);
  const [updated] = await db.update(settingsTable).set(parsed.data).where(eq(settingsTable.id, settings.id)).returning();
  res.json(updated);
});

export default router;
