import { Hono } from "hono";

const app = new Hono();

app.get("/:id", (c) => c.json({ hello: "world!" }));
app.get("/:month-:year", (c) => c.json({ hello: "hii!" })); // TODO

export default app;
