import { Hono } from "hono";
import spottings from "./routes/spottings";
import metadata from "./routes/metadata";
import form from "./routes/form";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { spottings as spottings_schema } from "./db/schema";
import { cors } from "hono/cors";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api/v2");

app.use("*", (ctx, next) => {
  const wrapped = cors({
    origin: [
      "http://localhost:3000",
      "https://staging-kv.whereisthegooglecar.com",
    ],
  });
  return wrapped(ctx, next);
});

app.route("/spottings", spottings);
app.route("/metadata", metadata);
app.route("/form", form);

export default app;
