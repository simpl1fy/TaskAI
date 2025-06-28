import { Hono } from "hono";
import { db } from "../db/db";
import { categories } from "../db/schema";
import { requireAuth } from "../middleware/requireAuth";
import { eq } from "drizzle-orm";


const categoryRouter = new Hono();

categoryRouter.get("/get_all", requireAuth, async(c) => {
    try {
        const { userId } = c.get("authData");
        if(!userId) {
          return c.json({ success: false, message: "User ID not found!" }, 400);
        }

        const categoryNames = await db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.userId, userId));
        console.log(categoryNames);

        return c.json({ success: true, data: categoryNames });
    } catch (err) {
        console.error("An error occured while fetching user categories =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
})


export default categoryRouter;