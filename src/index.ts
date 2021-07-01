// External imports
import Router from "koa-router";
require('dotenv').config()
const koa = require("koa")
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

// Internal imports
import userRouter from "./routes/user"
import authRouter from "./routes/auth"
import weekRouter from "./routes/week"
import categoryTypeRouter from "./routes/categoryType"

const app = new koa()

// Middleware
app.use(bodyParser());

app.keys = [process.env.TOKEN_KEY]

const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: true, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};

app.use(session(CONFIG, app))

// Routers
let restRouter = new Router()

restRouter.use("/rest", userRouter.routes(), userRouter.allowedMethods())
restRouter.use("/rest", authRouter.routes(), authRouter.allowedMethods())
restRouter.use("/rest", weekRouter.routes(), weekRouter.allowedMethods())
restRouter.use("/rest", categoryTypeRouter.routes(), categoryTypeRouter.allowedMethods())

app.use(restRouter.routes())

// Start server
app.listen(process.env.PORT, () => {
    console.log("Listening on port "+process.env.PORT)
})

