import { drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import postgres from "postgres";
import { spottings as spottings_schema } from "../db/schema";
import { metadataController } from "../controllers/metadata.controller";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/services", async (c) => {
  const data = await metadataController.getServices(c);
  return c.json(data);
});

app.get("/countries", async (c) => {
  const data = await metadataController.getCountries(c);
  return c.json(data);
});

app.get("/date-span", async (c) => {
  const data = await metadataController.getDateSpan(c);
  return c.json(data);
});
app.get("/available-months", (c) => c.json({ hello: "world!" }));

export default app;
