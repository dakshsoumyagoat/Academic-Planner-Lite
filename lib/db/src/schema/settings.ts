import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("dark"),
  accentColor: text("accent_color").notNull().default("#4aff00"),
  jeeMainDate: text("jee_main_date").notNull().default("2026-01-22"),
  jeeAdvancedDate: text("jee_advanced_date").notNull().default("2026-05-18"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
