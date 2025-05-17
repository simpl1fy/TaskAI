import { Hono } from "hono";
import { db } from "../db/db";
import { tasksList, tasks, users } from "../db/schema";
import { requireAuth } from "../middleware/requireAuth";
import { getAuth } from "@hono/clerk-auth";
import { eq } from "drizzle-orm";

const tasksRouter = new Hono();

tasksRouter.get('/all_lists', requireAuth, async (c) => {
    try {
        const { userId } = c.get('authData');
        
        const allTasks = await db.select().from(tasksList).leftJoin(tasks, eq(tasksList.id, tasks.taskListId)).where(eq(tasksList.userId, userId));
        return c.json({ success: true, allTasks }, 200);
    } catch(err) {
        console.error("An error occured when fetching all tasks lists =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
});

tasksRouter.post('/add_list', requireAuth, async (c) => {
    try {
        const { userId } = c.get('authData');
        const { title, tasksArray } = await c.req.json();

        if(!title || typeof title !== "string") {
            return c.json({ success: false, message: "Title is required!" });
        }

        if (tasksArray.length === 0 || !Array.isArray(tasksArray)) {
          return c.json({ success: false, message: "Tasks are required!" });
        }


        const insertedList = await db.insert(tasksList).values({ userId, title }).returning({ insertedId: tasksList.id});
        console.log(insertedList);
        const listId = insertedList[0]?.insertedId;
        
        if(!listId) {
            return c.json({ success: false, message: "Failed to insert task list" });
        }

        const taskRows = tasksArray.map((taskTitle: string) => ({
          title: taskTitle,
          taskListId: listId,
        }));

        await db.insert(tasks).values(taskRows);

        return c.json({ success: true, message: "Task List added successfully" });

    } catch(err) {
        console.error("An error occured while adding task list =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
})

export default tasksRouter;