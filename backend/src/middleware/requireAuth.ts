import { Context, Next, MiddlewareHandler } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import 'dotenv/config';

type AuthData = {
    userId: string;
}

declare module 'hono' {
    interface ContextVariableMap {
        authData: AuthData;
    }
}

export const requireAuth: MiddlewareHandler = async (c: Context, next: Next) => {
    await clerkMiddleware()(c, async () => {});

    const auth = getAuth(c);
    console.log(auth);

    
    if(!auth?.userId) {
        return c.json({ error: "Authentication Required!" }, 401);
    }

    c.set('authData', {
        userId: auth?.userId
    })

    await next();
}