import Application from 'koa';
import router from 'koa-router';

import {
 userAdminRouter,
 categoryRouter,
 noteRouter,
 activityTypeRouter,
 analyticsRouter,
 authRouter,
 categoryTypeRouter,
 weekRouter,
 authPublicRouter,
} from 'routes';

export const setupRoutes = (app: Application):void => {
    // Admin router is for endpoints only accessible by someone with an admin access token.
    const adminRouter = new router();
    adminRouter.use('/admin', userAdminRouter.routes(), userAdminRouter.allowedMethods());

    // Public router is for regular users.
    const publicRouter = new router();
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
    const apiPresetRouter = new router({ prefix: '/api' });
    apiPresetRouter.use(
        adminRouter.routes(),
        publicRouter.routes(),
        authPublicRouter.routes(),
    );

    app.use(apiPresetRouter.routes());
};
