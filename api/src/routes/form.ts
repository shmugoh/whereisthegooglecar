import { Hono } from "hono";
import { formController } from "../controllers/form.controller";
import { validator } from "hono/validator";
import { Env } from "../utils/constants";
import { FormSchema, PresignSchema } from "../utils/schemas/input_schema";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{ Bindings: Env }>();

app.post(
  "/submit",

  // Validate Schema
  validator("json", (value, c) => {
    const parsed = FormSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),

  // Handle Request
  async (c) => {
    const body = c.req.valid("json");
    const result = await formController.submitForm(c, body);
    return c.json(result);
  }
);

app.post(
  "/edit",

  // Validate Schema
  validator("json", (value, c) => {
    const parsed = FormSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),

  // Handle Request
  async (c) => {
    const body = c.req.valid("json");
    const result = await formController.editForm(c, body);
    return c.json(result);
  }
);

app.post(
  "/presign-s3",

  // Validate Schema
  validator("json", (value, c) => {
    const parsed = PresignSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, { message: "Invalid Parameters" });
    }
    return parsed.data;
  }),

  // Handle Request
  async (c) => {
    const body = await c.req.valid("json");
    const result = await formController.presignS3(c, body);
    return c.json(result);
  }
);

export default app;
