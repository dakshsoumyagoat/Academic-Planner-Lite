import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const holidaysTable = pgTable("holidays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Holiday = typeof holidaysTable.$inferSelect;
