import { Hono } from "hono";
import { db } from "../db/db";
import { users } from "../db/schema";
import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const userRouter = new Hono();

/**
 * @openapi
 * /user/sync:
 *   post:
 *     tags:
 *       - User
 *     summary: Sync user data from Clerk to the database
 *     description: Creates a new user entry in the database if one doesn't already exist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-clerk-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Clerk user ID for identifying the authenticated user
 *     responses:
 *       200:
 *         description: User synced successfully or already exists
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
 *         description: Missing or invalid Clerk user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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