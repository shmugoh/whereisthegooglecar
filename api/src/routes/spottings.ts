import { Hono } from "hono";
import { spottingsController } from "../controllers/spottings.controller";
import superjson from "superjson";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/search", async (c) => {
  const { town, service, month, year, cache } = c.req.queries();

  const result = await spottingsController.getByQuery(
    c,
    town,
    service,
    month,
    year,
    cache
  );

  return c.json(result);

  // return c.json({
  //   town: town,
  //   service: service,
  //   month: month,
  //   year: year,
  //   cache: cache,
  // });
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await spottingsController.getById(c, id);
  return c.json(result);
});

export default app;
