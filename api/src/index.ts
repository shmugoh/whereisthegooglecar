import { Hono } from "hono";
import spottings from "./spottings";
import metadata from "./metadata";
import form from "./form";

const app = new Hono();

app.route("/api/v2/spottings", spottings);
app.route("/api/v2/metadata", metadata);
app.route("/api/v2/form", form);

export default app;
