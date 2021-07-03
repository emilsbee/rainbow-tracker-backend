// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
import {createUser, getUserInfo} from "../dao/userDao";

let router = new Router(); // Initialize router

export type User = {
    userid:string,
    email:string,
    password:string,
    role:string
}

/**
 * Create a user with given user_id, email, password.
 */
router.post('/users', contentType.JSON, protect.admin, async  (ctx:Context, next:Next) => {
    let user = ctx.request.body as User

    ctx.status = await createUser(user.email, user.password, user.role)
});

/**
 * Get information about the user.
 * @return User
 */
router.get("/user/:userid", protect.user, async (ctx:Context) => {
    let userid:string = ctx.session.userid

    let {status, user} = await getUserInfo(userid)

    ctx.status = status
    ctx.body = user
})

export default router
