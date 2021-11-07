import Application from "koa";
import router from "koa-router";

import noteRouter from "../routes/public/note/note";
import analyticsRouter from "../routes/public/analytics";
import activityTypeRouter from "../routes/public/activityType";
import loginRouter from "../routes/public/login/login";
import userRouter from "../routes/admin/user";
import authRouter from "../routes/public/auth";
import weekRouter from "../routes/public/week/week";
import categoryTypeRouter from "../routes/public/categoryType";
import categoryRouter from "../routes/public/category/category";

export const setupRoutes = (app: Application):void => {
    // Admin router is for endpoints only accessible by someone with an admin access token.
    const adminRouter = new router();
    adminRouter.use("/admin", userRouter.routes(), userRouter.allowedMethods());

    // Public router is for regular users.
    const publicRouter = new router({ prefix: "/user/:userid" });
    publicRouter.use(
        noteRouter.routes(),
        categoryRouter.routes(),
        categoryTypeRouter.routes(),
        weekRouter.routes(),
        authRouter.routes(),
        activityTypeRouter.routes(),
        analyticsRouter.routes(),
    );

    // Adds api preset to all api related routes.
    const apiPresetRouter = new router({ prefix: "/api" });
    apiPresetRouter.use(
        adminRouter.routes(),
        publicRouter.routes(),
        loginRouter.routes(),
    );

    app.use(apiPresetRouter.routes());
};
