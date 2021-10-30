// External imports
const util = require('util');
import redis, {RedisClient} from "redis";

// get the current environment
let env = process.env.NODE_ENV

// convert to uppercase to compare against env variables
let envString:string
if (env) {
    envString = env.toUpperCase()
} else {
    throw new Error("You must have the environment variable NODE_ENV")
}

// access the environment variables for current environment
let redisHost = process.env['REDIS_HOST_' + envString]
let redisPort: string | undefined | number = process.env['REDIS_PORT_' + envString]

if (redisPort) {
    redisPort = parseInt(redisPort)
} else {
    throw new Error("Port provided for redis is not valid.")
}

const redisClient:RedisClient = redis.createClient({
    host: redisHost,
    port: redisPort
});

redisClient.on("error", () => {
    throw new Error("Could not connect to redis.")
})

redisClient.set = util.promisify(redisClient.set).bind(redisClient);
redisClient.get = util.promisify(redisClient.get).bind(redisClient);
redisClient.del = util.promisify(redisClient.del).bind(redisClient)
redisClient.setex = util.promisify(redisClient.setex).bind(redisClient)

export default redisClient