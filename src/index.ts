import koa from "koa";

require("dotenv").config();

import { setupRoutes, serveFrontend, setupMiddleware } from "./services";

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

