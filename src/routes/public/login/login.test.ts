// External imports
import * as request from "supertest"

// Internal imports
import server from "../../../index"
import {initialize, initializeWithData} from "../../../tests/helpers";
import redisClient from "../../../db/redis";
import {SESSION_COOKIE_NAME} from "../../../middleware/session";
import {User} from "../../admin/user";

export const testUser:User = {
    email: "test@test.com",
    password: "password",
    userid: "81823c86-ef44-4885-9933-929ed75e0876",
    salt: "6c605af47e13bf6b51bd3b6bc0b26eff"
}

export const testBadUser:User = {
    email: "fake@fake.fake",
    password: "wrong",
    userid: "fake",
    salt: "none"
}

const dataToPopulate = `INSERT INTO app_user(userid, email, password, salt) VALUES ('${testUser.userid}', '${testUser.email}', '09e323bac42cbcdcd27a1f0e060c0ac2cd35b9a34b233975b30997fa096f5836b39aa083dc139a12ea123809c212c70d49aa', '${testUser.salt}');`

beforeAll(async () => {
    await initialize()
    await initializeWithData(dataToPopulate)
})

describe("Route /auth/login tests", () => {
    test("Should successfully login user with correct credentials", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({email: testUser.email, password: testUser.password})

        expect(response.statusCode).toBe(200)

        expect(response.body).toMatchObject(    {
            userid: testUser.userid,
            email: testUser.email
        })

        expect(response.get("Set-Cookie")).toHaveLength(1)
        expect(response.get("Set-Cookie")[0].split("=")[0]).toBe(SESSION_COOKIE_NAME)
        expect(response.headers["content-type"]).toBe("application/json; charset=utf-8")
    })

    test("Should fail to login with a user which does not exist", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({email: testBadUser.email, password: testBadUser.password})

        expect(response.statusCode).toBe(404)

        expect(response.text).toBe("Not Found")

        expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
        expect(response.get("Set-Cookie")).toBeUndefined()
    })

    test("Should fail to login user with existing user bad password", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({email: testUser.email, password: testBadUser.password})

        expect(response.statusCode).toBe(401)

        expect(response.text).toBe("Unauthorized")

        expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
        expect(response.get("Set-Cookie")).toBeUndefined()
    })

    test("Should fail to login user with wrong request body", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({username: testBadUser.email, pass: testBadUser.password, userid: testBadUser.userid})

        expect(response.statusCode).toBe(404)

        expect(response.text).toBe("Not Found")

        expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
        expect(response.get("Set-Cookie")).toBeUndefined()
    })

    test("Should fail to login user with request body being a string and not a JSON object", async () => {
        const response = await request(server).post("/api/auth/login").send("something")

        expect(response.statusCode).toBe(415)

        expect(response.text).toBe("Unsupported Media Type")

        expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
        expect(response.get("Set-Cookie")).toBeUndefined()
    })
})

afterAll(async() => {
    await server.close()
    await redisClient.quit()
})