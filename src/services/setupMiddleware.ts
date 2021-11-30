import Application from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt";

import { errorHandler, errorMiddleware } from "../middleware/error";
import { logger } from "../middleware/logger";

export const setupMiddleware = (app: Application):void => {
    if (process.env.JWT_SECRET) {
        app.use(
            jwt({ secret: process.env.JWT_SECRET }).unless({ path: ["/api/auth/login", "/api/auth/refresh"] }),
        );
    } else {
        throw new Error("You must have environment variable JWT_SECRET");
    }
    app.use(errorMiddleware);
    app.use(logger);
    app.on("error", errorHandler);
    app.use(bodyParser());
};
