import { Hono } from "hono";
import { db } from "../db/db";
import { users } from "../db/schema";
import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const userRouter = new Hono();

userRouter.post('/sync', async(c) => {
    try {
        const userId = c.req.header('x-clerk-user-id');
        if(!userId) {
            return c.json({ error: "No user found!" });
        }

        const user = await clerkClient.users.getUser(userId);
        if(!user) {
            return c.json({ error: "User not found!" });
        }

        const userData = await db.select().from(users).where(eq(users.id, userId));
        // console.log(userData);
        if(userData.length === 0) {
            await db.insert(users).values({ id: userId, email: user.emailAddresses[0].emailAddress, name: user.firstName+" "+user.lastName, createdAt: new Date(user.createdAt) })

            return c.json({ success: true, message: "Data added to db" }, 200);
        }

        return c.json({ success: true, message: "Data already present" });
    } catch(err) {
        console.error("An error occured =", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
})

export default userRouter;