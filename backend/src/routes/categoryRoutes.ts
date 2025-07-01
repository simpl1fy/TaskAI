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

categoryRouter.patch("/update/:categoryId", requireAuth, async (c) => {
    try {
        const { userId } = c.get("authData");
        if(!userId) {
            return c.json({ success: false, message: "Please log in before continuing!" }, 500);
        }
        const categoryId = Number(c.req.param("categoryId"));

        if(!categoryId) {
            return c.json({ success: false, message: "Internal Server Error" }, 500);
        }

        const category = await db.select().from(categories).where(eq(categories.id, categoryId));
        if(!category) {
            return c.json({ success: false, message: "Category does not exist" }, 500);
        }

        const { categoryName } = await c.req.json();
        if(categoryName.trim() === "") {
            return c.json({ success: false, message: "Category Name cannot be empty!" }, 400);
        }

        const updatedData = await db.update(categories).set({ name: categoryName }).where(eq(categories.id, categoryId)).returning({ name: categories.name });
        // console.log("Updated data =", updateData);

        const updatedName = updatedData[0].name;

        return c.json({ success: true, updatedName, message: "Category name updated successfully!" }, 200);

    } catch (err) {
        console.error("An error occured while updating category name =", err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
})


export default categoryRouter;