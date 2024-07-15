import { Hono } from "hono";
import spottings from "./routes/spottings";
import metadata from "./routes/metadata";
import form from "./routes/form";
import { cors } from "hono/cors";

import { PotLogger, type Env } from "./utils/constants";
import { logger } from "hono/logger";

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
app.use(logger(PotLogger));

app.route("/spottings", spottings);
app.route("/metadata", metadata);
app.route("/form", form);

export default app;
