import { Hono } from "hono";
import { db } from "../db/db";
import { tasksList, tasks, categories } from "../db/schema";
import { requireAuth } from "../middleware/requireAuth";
import { eq, desc, and } from "drizzle-orm";

const tasksRouter = new Hono();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskItem:
 *       type: object
 *       properties:
 *         taskId:
 *           type: integer
 *           description: Unique identifier for the task
 *         taskTitle:
 *           type: string
 *           description: Title of the task
 *         taskStatus:
 *           type: boolean
 *           nullable: true
 *           description: Status of the task (true for completed, false for incomplete, null if not set)
 *       required:
 *         - taskId
 *         - taskTitle
 *     
 *     GroupedTaskList:
 *       type: object
 *       properties:
 *         listId:
 *           type: integer
 *           description: Unique identifier for the task list
 *         listTitle:
 *           type: string
 *           description: Title of the task list
 *         createdAt:
 *           type: string
 *           example: 2025-05-17 17:31:04.824857
 *           nullable: true
 *           description: Creation date and time of the task list in format YYYY-MM-DD HH:MM:SS.SSSSSS
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskItem'
 *           description: Array of tasks belonging to this list
 *       required:
 *         - listId
 *         - listTitle
 *         - tasks
 */
type TaskItem = {
  taskId: number;
  taskTitle: string;
  taskStatus: string | null;
};

type GroupedTaskList = {
  listId: number;
  listTitle: string;
  createdAt: Date | null;
  tasks: TaskItem[];
};

/**
 * @swagger
 * /task/all_lists:
 *   get:
 *     summary: Get all task lists with their tasks
 *     tags:
 *       - Task Lists
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of task lists with tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 allTasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupedTaskList'
 *       400:
 *         description: Malformed input(Missing user id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Malformed input(Missing user id/Server Error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
tasksRouter.get('/all_lists/:categoryId', requireAuth, async (c) => {
  try {
    const { userId } = c.get('authData');
    const categoryId = Number(c.req.param("categoryId"));

    console.log(categoryId);

    if (!userId) {
      return c.json({ success: false, message: "User ID not found!" }, 400);
    }

    if (categoryId !== -1) {
      const allTasks = await db.select().from(tasksList).innerJoin(tasks, eq(tasksList.id, tasks.taskListId)).where(and(eq(tasksList.userId, userId), eq(tasksList.categoryId, categoryId))).orderBy(desc(tasksList.createdAt), tasks.order);
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
    }

    const allTasks = await db.select().from(tasksList).innerJoin(tasks, eq(tasksList.id, tasks.taskListId)).where(eq(tasksList.userId, userId)).orderBy(desc(tasksList.createdAt), tasks.order);
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
  } catch (err) {
    console.error("An error occured when fetching all tasks lists =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Invalid Input"
 *
 *     TaskListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/GroupedTaskList'
 */
interface Task {
  taskId: number;
  taskTitle: string;
  taskStatus: string | null;
  taskOrder: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface TaskList {
  listId: number;
  listTitle: string;
  listCreatedAt: Date | null;
  category: Category;
  tasks: Task[];
}
/**
 * @swagger
 * /task/task_list/{id}:
 *   get:
 *     summary: Get a specific task list with all its tasks
 *     description: Retrieves a task list and all associated tasks by the task list ID
 *     tags: [Task Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task list to retrieve
 *         example: 10
 *     responses:
 *       200:
 *         description: Task list successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TaskListResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task list not found or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
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
      .innerJoin(tasks, eq(tasks.taskListId, taskListId))
      .innerJoin(categories, eq(categories.id, tasksList.categoryId))
      .where(eq(tasksList.id, taskListId))
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
      category: {
        id: result[0].categories.id,
        name: result[0].categories.name
      },
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
          taskOrder: row.tasks.order,
        });
      }
    });

    return c.json({ success: true, data: listData });
  } catch (err) {
    console.error("An error occured when fetching single task list =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});


/**
 * @swagger
 * /task/update_status:
 *   patch:
 *     summary: Update the status of a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - status
 *             properties:
 *               taskId:
 *                 type: integer
 *                 example: 42
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   exmaple: true
 *                 message:
 *                   type: string
 *                   example: "Updated Successfully!"
 *       400:
 *         description: Invalid input (wrong types or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid Input!"
 *       404:
 *         description: Task not found or failed to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update task"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   exmaple: "Internal Server Error"
 */
tasksRouter.patch("/update_status", requireAuth, async (c) => {
  try {
    const { taskId, status } = await c.req.json();
    console.log(taskId, status);
    if (typeof taskId !== "number" || status === undefined || status === null) {
      return c.json({ success: false, message: "Invalid Input!" }, 400);
    }

    const res = await db
      .update(tasks)
      .set({ status: status })
      .where(eq(tasks.id, taskId));

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

/**
 * @swagger
 * /task/delete_task/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid task ID input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

tasksRouter.delete('/delete_task/:id', requireAuth, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    // const { userId } = c.get("authData");

    if (isNaN(id)) {
      return c.json({ success: false, message: "Invalid Input" });
    }

    const res = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (res.length == 0) {
      return c.json(
        { success: false, message: "Task not found or already deleted" },
        404
      );
    }
    return c.json(
      { success: true, message: "Deleted Task Successfully" },
      200
    );
  } catch (err) {
    console.error("An error occured while deleting individual tasks =", err);
    return c.json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /task/add_list:
 *   post:
 *     summary: Add a new task list with tasks
 *     tags:
 *       - Task Lists
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - tasksArray
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My New Task List"
 *               tasksArray:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Buy groceries", "Walk the dog"]
 *               category:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: number
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "default"
 *     responses:
 *       200:
 *         description: Task list and tasks added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task List added successfully
 *       400:
 *         description: Validation error (missing title or tasks)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object*
*/
tasksRouter.post('/add_list', requireAuth, async (c) => {
  try {
    const { userId } = c.get('authData');
    const { title, tasksArray, category } = await c.req.json();

    if (!title || typeof title !== "string") {
      return c.json({ success: false, message: "Title is required!" });
    }

    if (!Array.isArray(tasksArray) || tasksArray.length === 0) {
      return c.json({ success: false, message: "Tasks are required!" });
    }

    if (category.id === -1 || Number.isNaN(category.id) || category.id === undefined) {
      return c.json({ success: false, message: "Please select a category" });
    }

    const insertedList = await db.insert(tasksList).values({ userId, title, categoryId: category.id }).returning({ insertedId: tasksList.id });
    // console.log(insertedList);
    const listId = insertedList[0]?.insertedId;

    if (!listId) {
      return c.json({ success: false, message: "Failed to insert task list" });
    }

    const taskRows = tasksArray.map((taskTitle: string, index) => ({
      title: taskTitle,
      taskListId: listId,
      order: index
    }));

    await db.insert(tasks).values(taskRows);

    return c.json({ success: true, message: "Task List added successfully" });

  } catch (err) {
    console.error("An error occured while adding task list =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});


/**
 * @openapi
 * /task/update/{listId}:
 *   put:
 *     summary: Update a task list and its tasks
 *     tags:
 *       - Task Lists
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task list to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listTitle
 *               - newTasks
 *             properties:
 *               listTitle:
 *                 type: string
 *                 example: "Updated Task List Title"
 *               newTasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - taskTitle
 *                   properties:
 *                     taskId:
 *                       type: integer
 *                       description: If present, updates an existing task
 *                       example: 42
 *                     taskTitle:
 *                       type: string
 *                       example: "Updated Task Title"
 *     responses:
 *       200:
 *         description: Task list and tasks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: List has been updated
 *       400:
 *         description: Bad input (empty title or tasks)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized or task list not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Unauthorized or list not found!
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

tasksRouter.put("/update/:listId", requireAuth, async (c) => {
  try {
    const listId = Number(c.req.param("listId"));
    const { userId } = c.get("authData");

    const { listTitle, categoryId, newTasks } = await c.req.json();
    console.log("Tasks received =", newTasks);

    if (!listTitle || typeof listTitle !== "string" || listTitle.trim() === "") {
      return c.json({ success: false, message: "List title is required!" }, 400);
    }

    if (!Array.isArray(newTasks) || newTasks.some(task => !task.taskTitle || task.taskTitle.trim() === "")) {
      return c.json({ success: false, message: "Task's cannot be empty" }, 400);
    }

    if (!categoryId || Number.isNaN(categoryId)) {
      return c.json({ success: false, message: "Category not provided" }, 400);
    }

    const existingList = await db.select().from(tasksList).where(eq(tasksList.id, listId));
    if (!existingList || existingList[0].userId !== userId) {
      return c.json({ success: false, message: "Unauthorized or list not found!" }, 403);
    }
    // console.log("Existing List =", existingList);

    // updating taskList title
    const taskListTitleUpdate = await db.update(tasksList).set({ title: listTitle }).where(eq(tasksList.id, listId));

    if (!taskListTitleUpdate) {
      return c.json({ success: false, message: "Failed to update list title" }, 500);
    }

    const taskCategoryUpdate = await db.update(tasksList).set({ categoryId: categoryId }).where(eq(tasksList.id, listId));

    if (!taskCategoryUpdate) {
      return c.json({ success: false, message: "Failed to update task category!" }, 500);
    }


    const tasksToInsert = newTasks.filter((task) => !task.taskId);
    const tasksToUpdate = newTasks.filter((task) => task.taskId);

    // Insert new tasks
    if (tasksToInsert.length > 0) {
      const insertTasks = tasksToInsert.map((task, _) => ({
        title: task.taskTitle.trim(),
        status: "incomplete" as const,
        taskListId: listId,
        order: task.taskOrder
      }));

      await db.insert(tasks).values(insertTasks);
    }

    for (let i = 0; i < tasksToUpdate.length; i++) {
      const task = tasksToUpdate[i];
      await db
        .update(tasks)
        .set({
          title: task.taskTitle,
          order: task.taskOrder,
        })
        .where(eq(tasks.id, task.taskId));
    }

    return c.json({ success: true, message: "List has been updated" }, 200);

  } catch (err) {
    console.error("An error occured while updating list =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

/**
 * @swagger
 * /task/delete_list:
 *   delete:
 *     summary: Delete a task list by ID
 *     tags:
 *       - Task Lists
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskListId
 *             properties:
 *               taskListId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Task list deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: List deleted successfully
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid Input
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
tasksRouter.delete("/delete_list", requireAuth, async (c) => {
  try {
    const { taskListId } = await c.req.json();

    if (typeof taskListId !== "number") {
      return c.json({ success: false, message: "Invalid Input" });
    }
    const res = await db.delete(tasksList).where(eq(tasksList.id, taskListId));
    console.log(res);

    return c.json({ success: true, message: "List deleted successfully" }, 200);
  } catch (err) {
    console.error("An error occured while deleting list =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

export default tasksRouter;
