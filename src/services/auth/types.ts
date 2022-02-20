import * as i from 'types';

export type SessionObject = {
  userid: string;
  active: boolean;
};

export type GenerateAccessToken = (data: i.SessionObject) => string;

export type GenerateRefreshToken = (userid: string) => Promise<string>;

export type ValidateRefreshTokenReturn = {
  isValid: boolean;
  userid: string | null;
};
export type ValidateRefreshToken = (refreshToken: string) => Promise<i.ValidateRefreshTokenReturn>;

export type RemoveRefreshToken = (userid: string) => Promise<boolean>;
