// External imports
import koa, {Context, Next} from "koa";
require('dotenv').config()
import bodyParser from 'koa-bodyparser'
import router from "koa-router";

// Internal imports
import {initialize} from "./test";
import loginRouter from "./routes/public/login"
import userRouter from "./routes/admin/user"
import authRouter from "./routes/public/auth"
import weekRouter from "./routes/public/week"
import categoryTypeRouter from "./routes/public/categoryType"
import {session} from "./middleware/session";
import {errorHandler, errorMiddleware} from "./middleware/error";

if (process.env.NODE_ENV === "test") {
    (async () => await initialize((success:boolean) => {
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
publicRouter.use("/user/:userid", categoryTypeRouter.routes(), categoryTypeRouter.allowedMethods())
publicRouter.use("/user/:userid", weekRouter.routes(), weekRouter.allowedMethods())
publicRouter.use("/user/:userid", authRouter.routes(), authRouter.allowedMethods())

// Assigning all the routes to the app instance
app.use(adminRouter.routes()).use(adminRouter.allowedMethods())
app.use(publicRouter.routes()).use(publicRouter.allowedMethods())
app.use(loginRouter.routes()).use(loginRouter.allowedMethods())

/**
 * Start server
 */
app.listen(process.env.PORT, () => {
    console.log("Listening on port "+process.env.PORT)
})

