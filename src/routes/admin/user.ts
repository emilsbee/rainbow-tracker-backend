import * as i from "types";
import { Context } from "koa";
const Router = require("koa-router");

// Internal
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import { createUser, deleteUser, getUserInfo } from "../../dao/userDao";

const router = new Router(); // Initialize router

/**
 * Create a user with given userid, email, password.
 */
router.post("/users", contentType.JSON, protect.admin, async  (ctx:Context) => {
    const userToCreate = ctx.request.body as i.User;

    const { status, data: user, error } = await createUser(userToCreate.email, userToCreate.password);

    if (status === 422) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    if (user.length !== 0) {
        ctx.body = JSON.stringify([{
            userid: user[0].userid,
            email: user[0].email,
        }]);
    } else {
        ctx.body = [];
    }
});

/**
 * Delete a user with given userid.
 */
router.delete("/users/:userid", protect.admin, async (ctx:Context) => {
    const userid = ctx.params.userid;
    const { status, error } = await deleteUser(userid);

    if (status === 400) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});

/**
 * Get information about the user.
 * @return User
 */
router.get("/users/:userid", protect.admin, async (ctx:Context) => {
    const userid:string = ctx.params.userid;

    const { status, data, error } = await getUserInfo(userid);

    if (status === 400) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    ctx.body = data;
});

export default router;
