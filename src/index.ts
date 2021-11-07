import koa from "koa";

require("dotenv").config();

import { setupRoutes } from "./services/setupRoutes";
import { setupMiddleware } from "./services/setupMiddleware";
import { serveFrontend } from "./services/serveFrontend";

const app = new koa();

setupMiddleware(app);
setupRoutes(app);
serveFrontend(app);


const server = app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV !== "test") {
        console.info("Listening on port " + process.env.PORT);
    }
});

export default server;

