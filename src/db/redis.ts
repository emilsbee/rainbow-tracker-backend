// External imports
const util = require('util');
import redis, {RedisClient} from "redis";

const redisClient:RedisClient = redis.createClient();
redisClient.set = util.promisify(redisClient.set).bind(redisClient);
redisClient.get = util.promisify(redisClient.get).bind(redisClient);
redisClient.del = util.promisify(redisClient.del).bind(redisClient)
redisClient.setex = util.promisify(redisClient.setex).bind(redisClient)

export default redisClient