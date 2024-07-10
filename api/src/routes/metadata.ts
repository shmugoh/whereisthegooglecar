import { Hono } from "hono";

const app = new Hono();

app.get("/services", (c) => c.json({ hello: "world!" }));
app.get("/companies", (c) => c.json({ hello: "world!" }));
app.get("/earliest-date", (c) => c.json({ hello: "world!" }));
app.get("/available-months", (c) => c.json({ hello: "world!" }));

export default app;
