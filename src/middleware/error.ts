// External imports
import { Context, Next } from 'koa';
import fs from 'fs';
import { DateTime } from 'luxon';
import path from 'path';

// Internal imports

/**
 * This is error catching middleware.
 * @param ctx in which error occurred.
 * @param next self explanatory.
 */
export const errorMiddleware = async (ctx:Context, next:Next):Promise<void> => {
    try {
        await next();
    } catch (e: any) {
        ctx.status = e.status || 500;
        ctx.body = e;
        ctx.app.emit('error', e, ctx);
    }
};

/**
 * This method handles the actual writing of errors to a log file.
 * @param err to log.
 * @param ctx for which error occurred.
 */
export const errorHandler = async (err:{path:string, message:string}, ctx:Context):Promise<void> => {
    try {
        await fs.promises.access(path.join(__dirname, '../../logs'));
    } catch (e) {
        await fs.promises.mkdir(path.join(__dirname, '../../logs'));
    }

    const stream = fs.createWriteStream(path.join(__dirname, '../../logs/errors.log'), { flags: 'a' });

    stream.write(`${DateTime.now().toLocaleString(DateTime.DATETIME_MED)} ${err.path} ${err.message} ${ctx.req.url} \n`);
};
