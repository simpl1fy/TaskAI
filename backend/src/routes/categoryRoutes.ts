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

categoryRouter.post("/create", requireAuth, async (c) => {
    try {
        const { userId } = c.get("authData");
        if(!userId) {
            return c.json({ success: false, message: "Please log in before continuing!" }, 500);
        }
        const { categoryName } = await c.req.json();

        if(categoryName.trim() === "") {
            return c.json({ success: false, message: "Category name cannot be empty" }, 400);
        }

        const insertedCategory = await db.insert(categories).values({ userId, name: categoryName }).returning({ insertedId: categories.id });
        
        console.log("Inserted Category id =", insertedCategory);

        const insertedCategoryId = insertedCategory[0].insertedId;

        return c.json({ success: true, insertedCategoryId });

    } catch (err) {
        console.error("An error occured while creating category =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
})


export default categoryRouter;