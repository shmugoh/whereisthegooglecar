import { Hono } from "hono";
import { metadataController } from "../controllers/metadata.controller";
import { Env } from "../utils/constants";
import { validator } from "hono/validator";
import { AvailableMonthsSchema } from "../utils/schemas/input_schema";
import { HTTPException } from "hono/http-exception";

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

app.get(
  "/available-months",

  // Validate Schema
  validator("query", (value, c) => {
    const parsed = AvailableMonthsSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),
  async (c) => {
    const data = c.req.valid("query");

    const result = await metadataController.getAvailableMonths(c, data);

    return c.json(result);
  }
);

export default app;
