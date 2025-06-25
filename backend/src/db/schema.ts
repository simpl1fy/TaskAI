import { timestamp, pgTable, boolean, varchar, integer } from "drizzle-orm/pg-core";

// export const statusEnum = pgEnum("status", ["pending", "completed"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at"),
});

export const tasksList = pgTable("tasks_lists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, {onDelete: 'cascade'}).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 255}).notNull().default("Default"),
  createdAt: timestamp("created_at").defaultNow()
});


export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  taskListId: integer("task_list_id").references(() => tasksList.id, {onDelete: 'cascade'}).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: boolean().default(false),
  order: integer("order").notNull().default(0)
});