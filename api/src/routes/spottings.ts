import { Hono } from "hono";
import { spottingsController } from "../controllers/spottings.controller";
import { Env } from "../utils/constants";
import { SearchIDSchema, SearchSchema } from "../utils/schemas/input_schema";
import { validator } from "hono/validator";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{ Bindings: Env }>();

app.get("/all", async (c) => {
  const result = await spottingsController.getAll(c);
  return c.json(result);
});

app.get(
  "/search",

  // Validate Schema
  validator("query", (value, c) => {
    const parsed = SearchSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),

  // Handle Request
  async (c) => {
    const data = c.req.valid("query");
    const result = await spottingsController.getByQuery(c, data);
    return c.json(result);
  }
);

app.get(
  "/:id",

  // Validate Schema
  validator("param", (value, c) => {
    const parsed = SearchIDSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),

  // Handle Request
  async (c) => {
    const data = c.req.valid("param");
    const result = await spottingsController.getById(c, data);
    return c.json(result);
  }
);

export default app;
