import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const syllabusTable = pgTable("syllabus_chapters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  track: text("track").notNull(),
  chapter: text("chapter").notNull(),
  status: text("status").notNull().default("not_started"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSyllabusSchema = createInsertSchema(syllabusTable).omit({ id: true, userId: true, updatedAt: true });
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type SyllabusChapter = typeof syllabusTable.$inferSelect;
