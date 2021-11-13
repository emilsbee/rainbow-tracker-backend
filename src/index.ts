import koa from "koa";

import { setupRoutes, setupMiddleware, serveFrontend } from "services";

require("dotenv").config();

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

