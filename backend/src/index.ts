import { Hono } from 'hono';
import { cors } from 'hono/cors';
import testRouter from "./routes/testRoutes";
import userRouter from './routes/userRoutes';
import tasksRouter from './routes/taskRoutes';
import 'dotenv/config';

const app = new Hono()

app.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    allowHeaders: ["x-clerk-user-id", "Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/test", testRouter); // test router
app.route("/user", userRouter);
app.route("/task", tasksRouter);

export default app;