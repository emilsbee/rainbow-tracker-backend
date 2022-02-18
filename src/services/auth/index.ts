import * as i from "types";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";

import { client } from "../../services/prismaClient";
import redisClient from "../../db/redis";

export const generateAccessToken = (data: i.SessionObject) => {
  if (process.env.JWT_SECRET) {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "43200s" }); // 43200seconds = 12hours;
  } else {
    throw new Error("You must have the environment variable JWT_SECRET");
  }
};

export const SESSION_EXPIRE_TIME_SECONDS = 172800;
export const generateRefreshToken = async (userid: string) => {
  const refreshToken = uuid();
  try {
      await client.session.create({
        data: {
          userid,
          refreshToken,
          expiresAt: DateTime.now().plus({ seconds: SESSION_EXPIRE_TIME_SECONDS }).toISO(),
        },
      });
  } catch (e: any) {
      throw new Error(e);
  }

  return refreshToken;
};

type ValidateRefreshTokenReturn = {
  isValid: boolean;
  userid: string | null;
}
type ValidateRefreshToken = (refreshToken: string) => Promise<ValidateRefreshTokenReturn>;
export const validateRefreshToken: ValidateRefreshToken = async (refreshToken) => {
  let returnData: ValidateRefreshTokenReturn = {
    isValid: false,
    userid: null,
  };

  try {
    const session = await client.session.findUnique({
      where: {
        refreshToken,
      },
    });

    if (
      session &&
      refreshToken === session.refreshToken &&
      DateTime.now().toISO() < DateTime.fromJSDate(session.expiresAt).toISO()
    ) {
      returnData = {
        isValid: true,
        userid: session.userid,
      };
    }
  } catch {
    throw new Error("Refresh token could not be fetched.");
  }

  return returnData;
};

export const removeRefreshToken = async (userid: string) => {
  try {
    await redisClient.del(userid);
  } catch {
    throw new Error("Redis could not remove refresh token");
  }
};
