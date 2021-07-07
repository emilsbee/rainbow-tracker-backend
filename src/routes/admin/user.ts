// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {createUser, deleteUser, getUserInfo} from "../../dao/userDao";
import u from "koa-session/lib/util";

let router = new Router(); // Initialize router

export type User = {
    userid:string,
    email:string,
    password:string,
    salt:string
}

/**
 * Create a user with given userid, email, password.
 */
router.post('/users', contentType.JSON, protect.admin, async  (ctx:Context, next:Next) => {
    let userToCreate = ctx.request.body as User

    let {status, user} = await createUser(userToCreate.email, userToCreate.password)
    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = user
});

/**
 * Delete a user with given userid.
 */
router.delete("/users/:userid", protect.admin, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let {status} = await deleteUser(userid)
    ctx.status = status
    ctx.set("Content-Type", "application/json")
})

/**
 * Get information about the user.
 * @return User
 */
router.get("/users/:userid", protect.admin, async (ctx:Context) => {
    let userid:string = ctx.params.userid

    let {status, user} = await getUserInfo(userid)

    ctx.status = status
    ctx.body = user
})

export default router
