import { db, usersTable } from "@workspace/db";
import { seedNewUserData } from "../lib/seed-data";
import type { Request, Response, NextFunction } from "express";

// Augment Express Request so all routes can access req.userId
declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

export let DEFAULT_USER_ID = 1;

/**
 * Called once on server startup. Ensures a single default user exists
 * in the database and is fully seeded (settings, syllabus, tests).
 */
export async function initDefaultUser(): Promise<void> {
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) {
    DEFAULT_USER_ID = existing[0]!.id;
    return;
  }
  // No users yet — create the default user and seed their data
  const [user] = await db
    .insert(usersTable)
    .values({ username: "default", passwordHash: "no-auth" })
    .returning();
  await seedNewUserData(user!.id);
  DEFAULT_USER_ID = user!.id;
}

/** Middleware: attaches the single default user id to every request. */
export function defaultUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.userId = DEFAULT_USER_ID;
  next();
}
