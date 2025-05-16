import { Hono } from 'hono';
import testRouter from "./routes/testRoutes";
import userRouter from './routes/userRoutes';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/test", testRouter);
app.route("/user", userRouter);

export default app