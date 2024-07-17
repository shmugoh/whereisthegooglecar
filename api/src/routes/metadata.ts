import { Hono } from "hono";
import { metadataController } from "../controllers/metadata.controller";
import { Env } from "../utils/constants";

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

app.get("/available-months", async (c) => {
  const { service, country, town, cache } = c.req.query();

  const data = await metadataController.getAvailableMonths(
    c,
    service,
    country,
    town,
    Boolean(cache)
  );

  return c.json(data);
});

export default app;
