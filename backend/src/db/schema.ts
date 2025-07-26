import { timestamp, pgTable, varchar, integer, unique, pgEnum } from "drizzle-orm/pg-core";

// export const statusEnum = pgEnum("status", ["pending", "completed"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at"),
});

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
}, (table) => [
  unique().on(table.userId, table.name)
])

export const tasksList = pgTable("tasks_lists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, {onDelete: 'cascade'}).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, {onDelete: 'set null'}),
  createdAt: timestamp("created_at").defaultNow()
});

export const statusEnum = pgEnum("status", ['incomplete', 'in_progress', 'completed']);

export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  taskListId: integer("task_list_id").references(() => tasksList.id, {onDelete: 'cascade'}).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: statusEnum(),
  order: integer("order").notNull().default(0)
});