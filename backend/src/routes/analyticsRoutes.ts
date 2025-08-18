import { Hono } from "hono";
import { db } from "../db/db";
import { tasks, tasksList } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";

const analyticsRouter = new Hono();

analyticsRouter.get("/data", requireAuth, async (c) => {
  try {
    const { userId } = c.get("authData");

    const userTasks = await db
      .select({ id: tasks.id, status: tasks.status })
      .from(tasksList)
      .where(eq(tasksList.userId, userId))
      .innerJoin(tasks, eq(tasksList.id, tasks.taskListId));
    
    const totalLength = userTasks.length;

    let complete=0;
    let incomplete=0;
    let workInProgress=0;

    userTasks.forEach((task) => {
      if(task.status === "completed") {
        complete += 1;
      }
      if(task.status === "incomplete") {
        incomplete += 1;
      }
      if(task.status === "in_progress") {
        workInProgress += 1;
      }      
    })

    return c.json({ total: totalLength, completed: complete, incomplete: incomplete, work_in_progress: workInProgress }, 200);
  } catch (err) {
    console.error("An error occured while fetching stats = " + err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

export default analyticsRouter;
