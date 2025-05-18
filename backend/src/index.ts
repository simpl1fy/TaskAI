import { Hono } from 'hono';
import { cors } from 'hono/cors';
import testRouter from "./routes/testRoutes";
import userRouter from './routes/userRoutes';
import tasksRouter from './routes/taskRoutes';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth } from './middleware/requireAuth';

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

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

app.post("/api/ai", requireAuth, async (c) => {
  try {
    const { prompt } = await c.req.json();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            listTitle: {
              type: Type.STRING
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              }
            }
          }
        }
      }
    });
    console.log(response.text);
    console.log(typeof response.text);

    return c.json({ success: true, data: response.text }, 200);
  } catch(err) {
    console.error("An error occured while generating response =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
})

export default app;