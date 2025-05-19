import { Hono } from 'hono';
import { cors } from 'hono/cors';
import testRouter from "./routes/testRoutes";
import userRouter from './routes/userRoutes';
import tasksRouter from './routes/taskRoutes';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth } from './middleware/requireAuth';
import { swaggerUI, SwaggerUI } from '@hono/swagger-ui';

import { swaggerSpec } from './lib/swagger';

const app = new Hono()

app.get("/doc", (c) => c.json(swaggerSpec));

app.get("/ui", swaggerUI({ url: '/doc' }));

app.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    allowHeaders: ["x-clerk-user-id", "Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/**
 * @openapi
 * /:
 *   get:
 *     summary: Say Hello
 *     tags:
 *       - Hello
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/test", testRouter); // test router
app.route("/user", userRouter);
app.route("/task", tasksRouter);

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

interface TaskResponse {
  listTitle: string;
  tasks: string[];
}

const parseGeminiResponse = (response: any): TaskResponse | null => {
  try {
    const responseText = response.text;

    if(!responseText) {
      console.error("Response text is undefined");
      return null;
    }

    const parsed = typeof responseText === "string" ? JSON.parse(responseText) : responseText;
    if(typeof parsed.listTitle !== "string" || !Array.isArray(parsed.tasks)) {
      console.error("Response did not match the required format!");
      return null;
    }

    return parsed as TaskResponse;
  } catch(err) {
    console.error("Failed to parse Gemini Response =", err);
    return null;
  }
}


/**
 * @openapi
 * /api/ai:
 *   post:
 *     summary: Generate tasks from a given prompt using AI
 *     tags:
 *       - Gemini
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Plan my day"
 *     responses:
 *       200:
 *         description: AI generated tasks successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 parsedData:
 *                   type: object
 *                   properties:
 *                     listTitle:
 *                       type: string
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Prompt is empty or not a string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.post("/api/ai", requireAuth, async (c) => {
  try {
    const { prompt } = await c.req.json();
    if(typeof prompt !== "string" || prompt.trim() === "") {
      return c.json({ success: false, message: "Prompt cannot be empty!" }, 400);
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            listTitle: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const parsedData = parseGeminiResponse(response);

    if(parsedData) {
      return c.json({ success: true, message: "Tasks generated successfully", parsedData }, 200);
    } else {
      return c.json({ success: false, message: "Failed to generate tasks. Try again later!" }, 500)
    }
  } catch(err) {
    console.error("An error occured while generating response =", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
})

export default app;