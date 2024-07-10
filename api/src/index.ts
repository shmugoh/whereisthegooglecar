import { Hono } from "hono";
import spottings from "./routes/spottings";
import metadata from "./routes/metadata";
import form from "./routes/form";

const app = new Hono();

app.route("/api/v2/spottings", spottings);
app.route("/api/v2/metadata", metadata);
app.route("/api/v2/form", form);

export default app;
