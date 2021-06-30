// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
import {createUser} from "../dao/userDao";

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


export default router
