// External imports
require('dotenv').config()
const koa = require("koa")
const bodyParser = require('koa-bodyparser');
import Router from "koa-router";

// Internal imports
import loginRouter from "./routes/public/login"
import userRouter from "./routes/admin/user"
import authRouter from "./routes/public/auth"
import weekRouter from "./routes/public/week"
import categoryTypeRouter from "./routes/public/categoryType"
import {session} from "./middleware/session";

const app = new koa()

/**
 * Middleware
 */
app.use(bodyParser());
app.use(session)

/**
 * Routers
 */
// Admin router is for endpoints only accessible by someone with an admin access token.
const adminRouter = new Router()
adminRouter.use("/admin", userRouter.routes(), userRouter.allowedMethods())

// Public router is for endpoints accessible by anyone. They only give data about the account that made the
// request.
const publicRouter = new Router()
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

