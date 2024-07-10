import { Hono } from "hono";
import { spottingsController } from "../controllers/spottings.controller";
import superjson from "superjson";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await spottingsController.getById(c, id);
  return c.json(result);
});

app.get("/:month/:year", async (c) => {
  const { month, year } = c.req.param();
  return c.body("month and year");
});

// app.get("/:month-:year", (c) => c.json({ hello: "hii!" })); // TODO

export default app;
