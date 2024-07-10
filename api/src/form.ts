import { Hono } from "hono";

const app = new Hono();

app.post("/submit", (c) => c.json({ hello: "world" }));
app.post("/edit", (c) => c.json({ hello: "world" }));

app.post("/presign-s3", (c) => c.json({ hello: "world" }));
app.put("/validate-turnstile", (c) => c.json({ hello: "world" }));

export default app;
