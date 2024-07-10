import { Hono } from "hono";
import spottings from "./routes/spottings";
import metadata from "./routes/metadata";
import form from "./routes/form";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { spottings as spottings_schema } from "./db/schema";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/test", async (c) => {
  const sql = postgres(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const result = await db.select().from(spottings_schema);

  console.log(result);
  return c.body("Hello World!");
});

app.route("/api/v2/spottings", spottings);
app.route("/api/v2/metadata", metadata);
app.route("/api/v2/form", form);

export default app;
