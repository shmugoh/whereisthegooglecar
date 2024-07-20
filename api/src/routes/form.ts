import { Hono } from "hono";
import { formController } from "../controllers/form.controller";
import { validator } from "hono/validator";
import { Env } from "../utils/constants";

const app = new Hono<{ Bindings: Env }>();

// TODO: implement validation: https://hono.dev/docs/guides/validation#with-zod

app.post("/submit", async (c) => {
  const body: FormSchema = await c.req.json();

  const result = await formController.submitForm(c, body);

  return c.json(result);
});
app.post("/edit", async (c) => {
  const body: FormSchema = await c.req.json();

  const result = await formController.editForm(c, body);

  return c.json(result);
});

app.post("/presign-s3", async (c) => {
  const body: presignS3 = await c.req.json();

  const result = await formController.presignS3(c, body);

  return c.json(result);
});

export default app;
