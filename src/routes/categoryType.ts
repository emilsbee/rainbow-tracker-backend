// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";

let router = new Router()

export type CategoryType = {
    categoryid:string,
    userid:string,
    color:string,
    name:string,
    archived:boolean
}

export type ActivityType = {
    activityid:string,
    categoryid:string,
    userid:string,
    long:string,
    short:string,
    archived:boolean
}

router.post("/category-type", contentType.JSON, protect.user, (ctx:Context, next:Next) => {
    const userid = ctx.session.userid
    let categoryType = ctx.request.body as CategoryType
})




export default router