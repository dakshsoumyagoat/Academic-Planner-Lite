import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateSettings() {
  const [existing] = await db.select().from(settingsTable);
  if (existing) return existing;
  const [created] = await db.insert(settingsTable).values({
    theme: "dark",
    accentColor: "#6366f1",
    jeeMainDate: "2027-01-22",
    jeeAdvancedDate: "2027-05-18",
  }).returning();
  return created;
}

router.get("/", async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.patch("/", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const settings = await getOrCreateSettings();
  const [updated] = await db.update(settingsTable).set(parsed.data).where(eq(settingsTable.id, settings.id)).returning();
  res.json(updated);
});

export default router;
