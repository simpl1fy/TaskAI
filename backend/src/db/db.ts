import 'dotenv/config';
import { Pool } from 'pg';
import * as schema from "./schema"
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

// import "dotenv/config";
// import { drizzle } from "drizzle-orm/neon-http";

// const connectionString: string = process.env.DATABASE_URL!;

// export const db = drizzle(connectionString);