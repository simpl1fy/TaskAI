import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

const connectionString: string = process.env.DATABASE_URL!;

export const db = drizzle(connectionString);