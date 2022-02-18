import * as i from "types";
const crypto = require("crypto");

import { client } from "../services/prismaClient";

export const login = async (
    email:string,
    password:string,
):Promise<i.DaoResponse<LoginReturnProps>> => {
    try {
        const user = await client.appUser.findUnique({
            where: {
                email,
            },
        });

        if (user) {
            const givenPasswordHash = crypto.pbkdf2Sync(password, user.salt, 1000, 50, "sha512").toString("hex");

            if (givenPasswordHash === user.password) {
                return {
                    data: {
                        userid: user.userid,
                        email: user.email,
                    },
                    status: 200,
                    error: "",
                };
            } else {
                return {
                    data: null,
                    error: "Incorrect email or password.",
                    status: 401,
                };
            }
        } else {
            return { status: 401, data: null, error: "Incorrect email or password." };
        }
    } catch (e: any) {
        return { status: 400, data: null, error: "Something went wrong." };
   };
};

type LoginReturnProps = {
    userid: string;
    email: string;
} | null;
