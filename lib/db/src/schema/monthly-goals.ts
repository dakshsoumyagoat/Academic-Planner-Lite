import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const monthlyGoalsTable = pgTable("monthly_goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull().default("Custom"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  priority: text("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMonthlyGoalSchema = createInsertSchema(monthlyGoalsTable).omit({ id: true, createdAt: true });
export type InsertMonthlyGoal = z.infer<typeof insertMonthlyGoalSchema>;
export type MonthlyGoal = typeof monthlyGoalsTable.$inferSelect;
