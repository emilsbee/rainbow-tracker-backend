// External imports
import { Context, Next } from "koa";

// Internal imports
import redisClient from "../db/redis";

export type Session = {
    isNew:boolean,
    userid: string | null
}

export const SESSION_COOKIE_NAME = "rainbow:session";
export const SESSION_CONTEXT_OBJECT_NAME = "session";
export const SESSION_EXPIRE_TIME_SECONDS = 172800;

const unauthenticatedObject:Session = {
    isNew: true,
    userid: null,
};

/**
 * Koa middleware for managing session using a cookie. It checks for the
 * presence of the cookie, then calls a function to check in Redis whether
 * the sessionid provided in the cookie is of a user that is currently logged in.
 * It then adds to the ctx[SESSION_CONTEXT_OBJECT_NAME] object an object of type
 * Session informing whether the user is logged in and other information see type Session.
 */
export const session = async (ctx:Context, next:Next):Promise<void> => {
    const sessionid = ctx.cookies.get(SESSION_COOKIE_NAME);

    if (sessionid) { // If session cookie is present
        ctx[SESSION_CONTEXT_OBJECT_NAME] = await getSession(sessionid);
    } else { // If the session cookie isn't present
        ctx[SESSION_CONTEXT_OBJECT_NAME] = unauthenticatedObject;
    }

    await next();

    // Logout logic
    if (ctx[SESSION_CONTEXT_OBJECT_NAME] == null) { // Logout must've happened
        if (sessionid) {
            try {
                await redisClient.del(sessionid);
            } catch (e) {
                console.error(e);
            }
        }
        ctx.cookies.set(SESSION_COOKIE_NAME, null);
    }
};

/**
 * Given a sessionid, this function checks in redis whether the
 * session exists and hasn't expired. Returns either an appropriate
 * Session object.
 * @param sessionid of the session to check.
 */
const getSession = async (sessionid:string):Promise<Session> => {
    let session:Session; // The return object
    let redisRes; // The redis return object

    try {
        redisRes  = await redisClient.get(sessionid) as unknown as string | null; // Check in redis if the sessionid exists

        if (redisRes) { // If the user is logged in under that sessionid
            await redisClient.setex(sessionid, SESSION_EXPIRE_TIME_SECONDS,  redisRes);
            session = {
                isNew: false,
                userid: JSON.parse(redisRes).userid,
            };
        } else { // If the user is not logged in under that sessionid
            session = unauthenticatedObject;
        }
    } catch (e) {
        return unauthenticatedObject;
    }

    return session;
};
