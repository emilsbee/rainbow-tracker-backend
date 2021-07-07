// External imports
import {encrypt, decrypt} from "./utils/encrypt";
require('dotenv').config()
const koa = require("koa")
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

// Internal imports
import loginRouter from "./routes/public/login"
import userRouter from "./routes/admin/user"
import authRouter from "./routes/public/auth"
import weekRouter from "./routes/public/week"
import categoryTypeRouter from "./routes/public/categoryType"
import Router from "koa-router";

const app = new koa()

// Middleware
app.use(bodyParser());

app.keys = [process.env.TOKEN_KEY]

const CONFIG = {
    encode: (cookie: { userid:string, _expire:number, _maxAge:number }) => encrypt(cookie),
    decode: (cookie:string) => decrypt(cookie),
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

// Start server
app.listen(process.env.PORT, () => {
    console.log("Listening on port "+process.env.PORT)
})

