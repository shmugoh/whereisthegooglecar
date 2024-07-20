import { Hono } from "hono";
import { spottingsController } from "../controllers/spottings.controller";
import { Env } from "../utils/constants";

const app = new Hono<{ Bindings: Env }>();

app.get("/search", async (c) => {
  const { country, town, service, month, year, cache, page } = c.req.query();

  const result = await spottingsController.getByQuery(
    c,
    country,
    town,
    service ? service.toLowerCase() : service,
    Number(month),
    Number(year),
    Number(page),
    Boolean(cache)
  );

  return c.json(result);
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await spottingsController.getById(c, id);

  return c.json(result);
});

export default app;
