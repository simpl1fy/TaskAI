import { Hono } from "hono";
import { db } from "../db/db";
import { users } from "../db/schema";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const userRouter = new Hono();

userRouter.get('/sync', async(c) => {
    try {
        const userId = c.req.header('x-clerk-user-id');
        if(!userId) {
            return c.json({ error: ""})
        }
        console.log(userId);

        const user = await clerkClient.users.getUser(userId);
        console.log(user);

        return c.json({ user }, 200);
    } catch(err) {
        console.error("An error occured =", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default userRouter;