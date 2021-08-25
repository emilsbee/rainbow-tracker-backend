// External imports
import koa from "koa";
import cors from "@koa/cors"
import bodyParser from 'koa-bodyparser'
import router from "koa-router";
require('dotenv').config()

// Internal imports
import {initialize} from "./test";
import analyticsRouter from "./routes/public/analytics"
import activityTypeRouter from "./routes/public/activityType"
import loginRouter from "./routes/public/login"
import userRouter from "./routes/admin/user"
import authRouter from "./routes/public/auth"
import weekRouter from "./routes/public/week/week"
import categoryTypeRouter from "./routes/public/categoryType"
import {session} from "./middleware/session";
import {errorHandler, errorMiddleware} from "./middleware/error";
import {logger} from "./middleware/logger";

if (process.env.NODE_ENV === "test") {
    (async () => await initialize((success: boolean) => {
        if (success) {
            process.exit(0)
        } else {
            process.exit(1)
        }
    }))()
}

/**
 * Initialize a koa application.
 */
const app = new koa()

/**
 * Middleware
 */
app.use(errorMiddleware)
app.use(logger)
app.on("error", errorHandler)
app.use(bodyParser());
app.use(session)
app.use(cors({
    origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
    credentials: true
}))

/**
 * Routers
 */
// Admin router is for endpoints only accessible by someone with an admin access token.
const adminRouter = new router()
adminRouter.use("/admin", userRouter.routes(), userRouter.allowedMethods())

// Public router is for endpoints accessible by anyone. They only give data about the account that made the
// request.
const publicRouter = new router()
publicRouter.use("/user/:userid", categoryTypeRouter.routes(), categoryTypeRouter.allowedMethods())
publicRouter.use("/user/:userid", weekRouter.routes(), weekRouter.allowedMethods())
publicRouter.use("/user/:userid", authRouter.routes(), authRouter.allowedMethods())
publicRouter.use("/user/:userid", activityTypeRouter.routes(), activityTypeRouter.allowedMethods())
publicRouter.use("/user/:userid", analyticsRouter.routes(), analyticsRouter.allowedMethods())
// Assigning all the routes to the app instance
app.use(adminRouter.routes()).use(adminRouter.allowedMethods())
app.use(publicRouter.routes()).use(publicRouter.allowedMethods())
app.use(loginRouter.routes()).use(loginRouter.allowedMethods())

/**
 * Start server
 */
app.listen(process.env.PORT, () => {
    console.log("Listening on port " + process.env.PORT)
})

