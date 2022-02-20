import * as i from "types";
import { Context } from "koa";
const Router = require("koa-router");

import { contentType, admin } from "middleware";
import { createUser, deleteUser, getUserInfo } from "dao";

export const userAdminRouter = new Router();

userAdminRouter.post("/users", contentType.JSON, admin, async  (ctx:Context) => {
    const userToCreate = ctx.request.body as i.User;

    const { status, data: user, error } = await createUser(userToCreate.email, userToCreate.password);

    if (error.length > 0) {
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

userAdminRouter.delete("/users/:userid", admin, async (ctx:Context) => {
    const userid = ctx.params.userid;
    const { status, error } = await deleteUser(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});

userAdminRouter.get("/users/:userid", admin, async (ctx:Context) => {
    const userid:string = ctx.params.userid;

    const { status, data, error } = await getUserInfo(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    ctx.body = data;
});
