import * as i from "types";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";

import { client } from "services";

import { authConfig } from "./config";

export const generateAccessToken: i.GenerateAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: authConfig.ACCESS_TOKEN_EXPIRE });
};

export const generateRefreshToken: i.GenerateRefreshToken = async (userid) => {
  const refreshToken = uuid();
  try {
      await client.session.create({
        data: {
          userid,
          refreshToken,
          expiresAt: DateTime.now().plus({ seconds: authConfig.REFRESH_TOKEN_EXPIRE }).toISO(),
        },
      });
  } catch (e: any) {
      throw new Error(e);
  }

  return refreshToken;
};

export const validateRefreshToken: i.ValidateRefreshToken = async (refreshToken) => {
  let returnData: i.ValidateRefreshTokenReturn = {
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
    return returnData;
  }

  return returnData;
};

export const removeRefreshToken: i.RemoveRefreshToken = async (userid) => {
  try {
    const { count } = await client.session.deleteMany({
      where: {
        userid,
      },
    });

    if (count === 0) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
