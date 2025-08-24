import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth";
import { productivityTimer } from "../db/schema";
import { db } from "../db/db";
import { eq, and } from "drizzle-orm";

const pRouter = new Hono();

type AddBodyType = {
  // checked
  startTime: number;
  endTime: number;
};

pRouter.post("/add", requireAuth, async (c) => {
  try {
    const { userId } = c.get("authData");
    const { startTime, endTime }: AddBodyType = await c.req.json();

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return c.json({ message: "Start and end must be finite!" }, 400);
    }

    const durationSec = (endTime - startTime) / 1000;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const dateOnly = startDate.toISOString().split("T")[0];

    // checking for existing data
    const dates = await db
      .select()
      .from(productivityTimer)
      .where(
        and(
          eq(productivityTimer.date, dateOnly),
          eq(productivityTimer.startedAt, startDate),
          eq(productivityTimer.endedAt, endDate),
          eq(productivityTimer.userId, userId)
        )
      );
    console.log("Existing Dates =", dates);

    if (dates.length == 0) {
      // If there is no existing entry
      const res = await db.insert(productivityTimer).values({
        userId: userId,
        startedAt: startDate,
        endedAt: endDate,
        duration: Math.floor(durationSec),
        date: dateOnly,
      });

      console.log("Result = " + res);

      return c.json(
        { success: true, message: "Time has been added", res },
        200
      );
    } else {
      console.error("The given time already exists!");
      return c.json({ message: "Already data present" }, 400);
    }
  } catch (err) {
    console.error("An error occured while adding time", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

type Group = {
  date: string;
  totalDuration: number;
}

type Row = {
  date: string;
  duration: number | null;
}

pRouter.get("/get_time", requireAuth, async (c) => {
  try {
    const { userId } = c.get("authData");
    const data: Row[] = await db
      .select({
        duration: productivityTimer.duration,
        date: productivityTimer.date,
      })
      .from(productivityTimer)
      .where(eq(productivityTimer.userId, userId));
    
    console.log("Data is =", data);

    const dataFixed = data.reduce<Group[]>((acc, { date, duration }) => {
      
      const amt = duration ?? 0;
      const found = acc.find((ele) => ele.date === date);
      if(found) {
        found.totalDuration += amt;
      } else {
        acc.push({ date, totalDuration: amt });
      }
      return acc;
    }, []);
    return c.json({ dataFixed }, 200);
  } catch (err) {
    console.error("An error occured while fetching durations per day =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

export default pRouter;
