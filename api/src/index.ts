import { Context, Hono } from "hono";
import spottings from "./routes/spottings";
import metadata from "./routes/metadata";
import form from "./routes/form";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import { PotLogger, type Env } from "./utils/constants";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "hono/adapter";
import { poweredBy } from "hono/powered-by";

const app = new Hono<{ Bindings: Env }>().basePath("/api/v2");

/* -- Configuration -- */
// CORS
app.use("*", (ctx, next) => {
  const wrapped = cors({
    origin: ctx.env.CORS_ORIGIN,
  });
  return wrapped(ctx, next);
});
// CSRF
app.use("*", (ctx, next) => {
  const wrapped = csrf({
    origin: ctx.env.CSRF_ORIGIN,
  });
  return wrapped(ctx, next);
});

// Others
// app.use(poweredBy());
app.use(secureHeaders());
app.use(logger(PotLogger));

/* -- Routes -- */
app.route("/spottings", spottings);
app.route("/metadata", metadata);
app.route("/form", form);

export default app;
