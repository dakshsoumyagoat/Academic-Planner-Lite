import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { seedNewUserData } from "../lib/seed-data";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

router.get("/status", async (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ id: req.session.userId, username: req.session.username });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  const trimmedUsername = username?.trim();
  if (!trimmedUsername || !password || password.length < 4) {
    res.status(400).json({ error: "Username and password (min 4 chars) required" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, trimmedUsername));
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ username: trimmedUsername, passwordHash }).returning();
  await seedNewUserData(user.id);
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ id: user.id, username: user.username });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username.trim()));
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ id: user.id, username: user.username });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ ok: true });
  });
});

export default router;
