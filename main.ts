import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";
import { handler as sessionMiddleware } from "./middleware.ts";

export const app = new App<State>();

app.use(staticFiles());
app.use(sessionMiddleware);

app.fsRoutes();
