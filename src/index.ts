// External imports
import koa from "koa";
import send from "koa-send"
import bodyParser from 'koa-bodyparser'
import router from "koa-router";
import koaStatic from "koa-static"
import fs from "fs";
import path from "path";

require('dotenv').config()

// Internal imports
import noteRouter from "./routes/public/note/note"
import analyticsRouter from "./routes/public/analytics"
import activityTypeRouter from "./routes/public/activityType"
import loginRouter from "./routes/public/login/login"
import userRouter from "./routes/admin/user"
import authRouter from "./routes/public/auth"
import weekRouter from "./routes/public/week/week"
import categoryTypeRouter from "./routes/public/categoryType"
import {session} from "./middleware/session";
import {errorHandler, errorMiddleware} from "./middleware/error";
import {logger} from "./middleware/logger";
import categoryRouter from "./routes/public/category/category";

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

/**
 * Routers
 */
// Admin router is for endpoints only accessible by someone with an admin access token.
const adminRouter = new router()
adminRouter.use("/admin", userRouter.routes(), userRouter.allowedMethods())


// Public router is for endpoints accessible by anyone. They only give data about the account that made the
// request.
const publicRouter = new router()
publicRouter.use("/user/:userid", noteRouter.routes(), noteRouter.allowedMethods())
publicRouter.use("/user/:userid", categoryRouter.routes(), categoryRouter.allowedMethods())
publicRouter.use("/user/:userid", categoryTypeRouter.routes(), categoryTypeRouter.allowedMethods())
publicRouter.use("/user/:userid", weekRouter.routes(), weekRouter.allowedMethods())
publicRouter.use("/user/:userid", authRouter.routes(), authRouter.allowedMethods())
publicRouter.use("/user/:userid", activityTypeRouter.routes(), activityTypeRouter.allowedMethods())
publicRouter.use("/user/:userid", analyticsRouter.routes(), analyticsRouter.allowedMethods())

// API preset
const apiPresetRouter = new router()
apiPresetRouter.use("/api", adminRouter.routes(), adminRouter.allowedMethods())
apiPresetRouter.use("/api", publicRouter.routes(), publicRouter.allowedMethods())
apiPresetRouter.use("/api", loginRouter.routes(), loginRouter.allowedMethods())

// Assigning all the routes to the app instance
app.use(apiPresetRouter.routes()).use(apiPresetRouter.allowedMethods())

// Checks that the frontendBuild folder is present
if (process.env.NODE_ENV === "production") {
    fs.access(path.join(__dirname, "../frontendBuild"), (e) => {
        if (e) {
            console.log(e)
            throw new Error("You must have frontendBuild folder at the project root.")
        }
    })
}

// Serving the react front-end
app.use(koaStatic("./frontendBuild"))
// Catch-all route for the react front-end
app.use(async function (ctx, next) {
        return send(ctx, '/index.html', {
            root: "./frontendBuild"
        }).then(() => next())
    }
)

/**
 * Start server
 */
const server = app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV !== "test") {
        console.log("Listening on porth " + process.env.PORT)
    }
})

export default server

