// External imports
import { Context, Next } from "koa";
import fs from "fs";
import { DateTime } from "luxon";
import path from "path";

/**
 * This method handles the actual writing of logs to a log file.
 */
export const logger = async (ctx:Context, next: Next):Promise<void> => {
    await next();

    try {
        await fs.promises.access(path.join(__dirname, "../../logs"));
    } catch (e) {
        await fs.promises.mkdir(path.join(__dirname, "../../logs"));
    }

    const stream = fs.createWriteStream(path.join(__dirname, "../../logs/requests.log"), { flags: "a" });

    stream.write(`${DateTime.now().toLocaleString(DateTime.DATETIME_MED)} ${ctx.req.url} \n`);
};
