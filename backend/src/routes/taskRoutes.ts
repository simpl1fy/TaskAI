import { Hono } from "hono";
import { db } from "../db/db";
import { tasksList, tasks, users } from "../db/schema";
import { requireAuth } from "../middleware/requireAuth";
import { eq } from "drizzle-orm";

const tasksRouter = new Hono();

type TaskItem = {
  taskId: number;
  taskTitle: string;
  taskStatus: boolean | null;
};

type GroupedTaskList = {
  listId: number;
  listTitle: string;
  createdAt: Date | null;
  tasks: TaskItem[];
};

tasksRouter.get('/all_lists', requireAuth, async (c) => {
    try {
        const { userId } = c.get('authData');
        
        const allTasks = await db.select().from(tasksList).leftJoin(tasks, eq(tasksList.id, tasks.taskListId)).where(eq(tasksList.userId, userId));
        console.log(allTasks);
        const grouped = allTasks.reduce<GroupedTaskList[]>((acc, row) => {
          const listId = row.tasks_lists.id;

          let existing = acc.find((item) => item.listId === listId);
          const task = row.tasks?.id
            ? {
                taskId: row.tasks.id,
                taskTitle: row.tasks.title,
                taskStatus: row.tasks.status,
              }
            : null;

          if (existing) {
            if (task) existing.tasks.push(task);
          } else {
            acc.push({
              listId: row.tasks_lists.id,
              listTitle: row.tasks_lists.title,
              createdAt: row.tasks_lists.createdAt,
              tasks: task ? [task] : [],
            });
          }

          return acc;
        }, []);
        return c.json({ success: true, allTasks: grouped }, 200);
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
});

tasksRouter.patch("/update_status", requireAuth, async (c) => {
    try {
        const { taskId, status } = await c.req.json();
        console.log(taskId, status);
        if(typeof taskId !== "number" || typeof status !== "boolean") {
            return c.json({ success: false, message: "Invalid Input" }, 400);
        }

        const res = await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
        // console.log(res);

        if(res.rowCount && res.rowCount > 0) {
            return c.json({ success: true, message: "Updated Successfully!" }, 200);
        } else {
            return c.json({ success: false, message: "Failed to update task" }, 404);
        }

    } catch(err) {
        console.error("An error occured while updating task status =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
})

export default tasksRouter;