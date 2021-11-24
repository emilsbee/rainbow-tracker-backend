import Application from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";

import { session } from "../middleware/session";
import { errorHandler, errorMiddleware } from "../middleware/error";
import { logger } from "../middleware/logger";

export const setupMiddleware = (app: Application):void => {
    app.use(errorMiddleware);
    app.use(logger);
    app.on("error", errorHandler);
    app.use(bodyParser());
    app.use(session);

    if (process.env.NODE_ENV === "development") {
        app.use(cors());
    }
};
