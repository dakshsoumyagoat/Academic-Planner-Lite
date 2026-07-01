import { Router } from "express";
import { db, holidaysTable } from "@workspace/db";

const router = Router();

router.get("/", async (req, res) => {
  const holidays = await db.select().from(holidaysTable).orderBy(holidaysTable.date);
  res.json(holidays);
});

export default router;
