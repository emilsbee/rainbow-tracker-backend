import * as i from 'types';
import * as s from 'superstruct';
const crypto = require('crypto');

import { client } from 'services';

import { CheckCredentialsModel } from './models';

export const checkCredentials: i.CheckCredentials = async ({
    email,
    password,
}) => {
    try {
        s.assert({ email, password }, CheckCredentialsModel);
    } catch (e: any) {
        return { status: 400, error: e.message, data: null, success: true };
    };

    try {
        const user = await client.appUser.findUnique({
            where: {
                email,
            },
        });

        if (user) {
            const givenPasswordHash = crypto.pbkdf2Sync(password, user.salt, 1000, 50, 'sha512').toString('hex');

            if (givenPasswordHash === user.password) {
                return {
                    data: {
                        userid: user.userid,
                        email: user.email,
                    },
                    status: 200,
                    error: '',
                    success: true,
                };
            } else {
                return {
                    data: null,
                    error: 'Incorrect email or password.',
                    status: 401,
                    success: true,
                };
            }
        } else {
            return { status: 401, data: null, error: 'Incorrect email or password.', success: true };
        }
    } catch (e: any) {
        return { status: 400, data: null, error: 'Something went wrong.', success: false };
   };
};
