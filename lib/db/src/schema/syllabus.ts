import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const syllabusTable = pgTable("syllabus_chapters", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  track: text("track").notNull(),
  chapter: text("chapter").notNull(),
  status: text("status").notNull().default("not_started"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSyllabusSchema = createInsertSchema(syllabusTable).omit({ id: true, updatedAt: true });
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type SyllabusChapter = typeof syllabusTable.$inferSelect;
