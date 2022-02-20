import Application from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt";

import { errorHandler, errorMiddleware, logger } from "middleware";

export const setupMiddleware = (app: Application):void => {
    app.use(
        jwt({ secret: process.env.JWT_SECRET }).unless({ path: ["/api/auth/jwt/create", "/api/auth/jwt/refresh"] }),
    );
    app.use(errorMiddleware);
    app.use(logger);
    app.on("error", errorHandler);
    app.use(bodyParser());
};
