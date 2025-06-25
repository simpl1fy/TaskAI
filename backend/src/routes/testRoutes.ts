import { Hono } from "hono";
import { db } from "../db/db";
import { users } from "../db/schema";

const testRouter = new Hono();

testRouter.post("/", async (c) => {
  try {
    const { id, name, email } = await c.req.json();
    await db.insert(users).values({ id, name, email });
    return c.json({ success: true }, 200);
  } catch (err) {
    console.error("error");
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

testRouter.get("/", async(c) => {
    try {
        const data = await db.select().from(users);
        console.log(data);
        return c.json({ data }, 200);
    } catch(err) {
        console.error("error fetching data =", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
})

export default testRouter;