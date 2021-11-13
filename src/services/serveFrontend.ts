import Application from "koa";
import send from "koa-send";
import koaStatic from "koa-static";
import fs from "fs";
import path from "path";

export const serveFrontend = (app: Application):void => {
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
        fs.accessSync(path.join(__dirname, "../../frontendBuild"));

        app.use(koaStatic("./frontendBuild"));

        // Catch-all route
        app.use(async function (ctx, next) {
                return send(ctx, "/index.html", {
                    root: "./frontendBuild",
                }).then(() => next());
            },
        );
    }
};
