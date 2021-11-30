import * as i from "types";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import redisClient from "../../db/redis";

export const generateAccessToken = (data: i.SessionObject) => {
  if (process.env.JWT_SECRET) {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "86400s" }); // 86400s = 1day;
  } else {
    throw new Error("You must have the environment variable JWT_SECRET");
  }
};

export const SESSION_EXPIRE_TIME_SECONDS = 172800;
export const generateRefreshToken = async (userid: string) => {
  const refreshToken = uuid();

  try {
      await redisClient.setex(userid, SESSION_EXPIRE_TIME_SECONDS, refreshToken);
  } catch (e) {
      throw new Error("Redis could not save refresh token");
  }

  return refreshToken;
};

export const validateRefreshToken = async (userid: string, refreshToken: string): Promise<boolean> => {
  let isValid = false;

  try {
    const fetchedRefreshToken = await redisClient.get(userid) as unknown as string | null;

    if (refreshToken === fetchedRefreshToken) {
      isValid = true;
    }
  } catch {
    throw new Error("Redis could not fetch refresh token");
  }

  return isValid;
};

export const removeRefreshToken = async (userid: string) => {
  try {
    await redisClient.del(userid);
  } catch {
    throw new Error("Redis could not remove refresh token");
  }
};
