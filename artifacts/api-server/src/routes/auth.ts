import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

router.get("/status", async (req, res) => {
  const [{ value }] = await db.select({ value: count() }).from(usersTable);
  const hasUser = Number(value) > 0;
  if (req.session.userId) {
    res.json({ loggedIn: true, hasUser, username: req.session.username });
  } else {
    res.json({ loggedIn: false, hasUser });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ id: req.session.userId, username: req.session.username });
});

router.post("/setup", async (req, res) => {
  const [{ value }] = await db.select({ value: count() }).from(usersTable);
  if (Number(value) > 0) {
    res.status(400).json({ error: "User already exists" });
    return;
  }
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password || password.length < 4) {
    res.status(400).json({ error: "Username and password (min 4 chars) required" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ username: username.trim(), passwordHash }).returning();
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
