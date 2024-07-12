import { Hono } from "hono";
import { spottingsController } from "../controllers/spottings.controller";
import superjson from "superjson";

export type Env = {
  DATABASE_URL: string;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/search", async (c) => {
  const { country, town, service, month, year, cache, page } = c.req.queries();

  const result = await spottingsController.getByQuery(
    c,
    country,
    town,
    service,
    month,
    year,
    page,
    cache
  );

  return c.json(result);
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await spottingsController.getById(c, id);

  return c.json(result);
});

export default app;
