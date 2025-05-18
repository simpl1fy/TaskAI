import { Hono } from "hono";
import { db } from "../db/db";
import { tasksList, tasks, users } from "../db/schema";
import { requireAuth } from "../middleware/requireAuth";
import { eq, desc } from "drizzle-orm";

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
        
        const allTasks = await db.select().from(tasksList).leftJoin(tasks, eq(tasksList.id, tasks.taskListId)).where(eq(tasksList.userId, userId)).orderBy(desc(tasksList.createdAt), tasks.order);
        // console.log(allTasks);
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

interface Task {
  taskId: number;
  taskTitle: string;
  taskStatus: boolean | null;
}

interface TaskList {
  listId: number;
  listTitle: string;
  listCreatedAt: Date | null;
  tasks: Task[];
}

tasksRouter.get("task_list/:id", requireAuth, async (c) => {
    try {
      const taskListId = Number(c.req.param("id"));
      const { userId } = c.get("authData");

      if (isNaN(taskListId)) {
        return c.json({ success: false, message: "Invalid Input" });
      }

      const result = await db
        .select()
        .from(tasksList)
        .leftJoin(tasks, eq(tasks.taskListId, taskListId))
        .orderBy(tasks.order);
      // console.log("result from get query =", result);

      if (result.length === 0 || result[0].tasks_lists.userId !== userId) {
        return c.json(
          { success: false, message: "Unauthorized or not found!" },
          404
        );
      }

      // First, get the task list data from the first row
      const listData: TaskList = {
        listId: result[0].tasks_lists.id,
        listTitle: result[0].tasks_lists.title,
        listCreatedAt: result[0].tasks_lists.createdAt,
        tasks: [],
      };

      // Create a Set to track which task IDs we've already processed to prevent duplicates
      const processedTaskIds = new Set();

      // Process each task, making sure we don't add duplicates
      result.forEach((row) => {
        // Only process if there's a task and we haven't seen this task ID before
        if (row.tasks && row.tasks.id && !processedTaskIds.has(row.tasks.id)) {
          processedTaskIds.add(row.tasks.id);

          listData.tasks.push({
            taskId: row.tasks.id,
            taskTitle: row.tasks.title,
            taskStatus: row.tasks.status,
          });
        }
      });

      return c.json({ success: true, data: listData });
    } catch(err) {
        console.error("An error occured when fetching single task list =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
});

tasksRouter.patch("/update_status", requireAuth, async (c) => {
  try {
    const { taskId, status } = await c.req.json();
    console.log(taskId, status);
    if (typeof taskId !== "number" || typeof status !== "boolean") {
      return c.json({ success: false, message: "Invalid Input" }, 400);
    }

    const res = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, taskId));
    // console.log(res);

    if (res.rowCount && res.rowCount > 0) {
      return c.json({ success: true, message: "Updated Successfully!" }, 200);
    } else {
      return c.json({ success: false, message: "Failed to update task" }, 404);
    }
  } catch (err) {
    console.error("An error occured while updating task status =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

tasksRouter.delete('/delete_task/:id', requireAuth, async (c) => {
    try {
        const id = Number(c.req.param("id"));
        const { userId } = c.get("authData");

        if(isNaN(id)) {
            return c.json({ success: false, message: "Invalid Input" });
        }

        const res = await db.delete(tasks).where(eq(tasks.id, id)).returning();
        /* FIXME:
            checking condition for .returning()
            if(res.length > 0) {
                return success
            } else {
                return failure
            }
        */
       // TODO: check with no .returning()
        console.log("Delete result =", res);

        console.log("Going to return success");
        return c.json({ success: true, message: "Deleted Task Successfully" }, 200);

    } catch(err) {
        console.error("An error occured while deleting individual tasks =", err);
        return c.json({ message: "Internal Server Error" });
    }
})

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
        // console.log(insertedList);
        const listId = insertedList[0]?.insertedId;
        
        if(!listId) {
            return c.json({ success: false, message: "Failed to insert task list" });
        }

        const taskRows = tasksArray.map((taskTitle: string, index) => ({
          title: taskTitle,
          taskListId: listId,
          order: index
        }));

        await db.insert(tasks).values(taskRows);

        return c.json({ success: true, message: "Task List added successfully" });

    } catch(err) {
        console.error("An error occured while adding task list =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
});

tasksRouter.put("/update/:listId", requireAuth, async (c) => {
  try {
    const listId = Number(c.req.param("listId"));
    const { userId } = c.get("authData");

    const { listTitle, newTasks } = await c.req.json();

    if(!listTitle || typeof listTitle !== "string" || listTitle.trim() === "") {
        return c.json({ success: false, message: "List title is required!" }, 400);
    }

    if(!Array.isArray(newTasks) || newTasks.some(task => !task.taskTitle || task.taskTitle.trim() === "")) {
        return c.json({ success: false, message: "Task's cannot be empty" }, 400);
    }

    const existingList = await db.select().from(tasksList).where(eq(tasksList.id, listId));
    if(!existingList || existingList[0].userId !== userId) {
        return c.json({ success: false, message: "Unauthorized or list not found!" }, 403);
    }
    console.log("Existing List =", existingList);

    const updateResponse = await db.update(tasksList).set({ title: listTitle }).where(eq(tasksList.id, listId));
    console.log("Updated Response =", updateResponse);

    const tasksToInsert = newTasks.filter((task) => !task.taskId);
    const tasksToUpdate = newTasks.filter((task) => task.taskId);

    // Insert new tasks
    if(tasksToInsert.length > 0) {
        const insertTasks = tasksToInsert.map((task, index) => ({
            title: task.taskTitle.trim(),
            completed: false,
            taskListId: listId,
            order: index
        }));

        await db.insert(tasks).values(insertTasks);
    }

    for (let i = 0; i < tasksToUpdate.length; i++) {
      const task = tasksToUpdate[i];
      await db
        .update(tasks)
        .set({
          title: task.taskTitle,
          order: i,
        })
        .where(eq(tasks.id, task.taskId));
    }

    return c.json({ success: true, message: "List has been updated" }, 200);

  } catch (err) {
    console.error("An error occured while updating list =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

tasksRouter.delete("/delete_list", requireAuth, async(c) => {
    try {
        const { taskListId } = await c.req.json();

        if(typeof taskListId !== "number") {
            return c.json({ success: false, message: "Invalid Input" });
        }
        const res = await db.delete(tasksList).where(eq(tasksList.id, taskListId));
        console.log(res);

        return c.json({ success: true, message: "List deleted successfully" }, 200);
    } catch(err) {
        console.error("An error occured while deleting list =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
});

export default tasksRouter;