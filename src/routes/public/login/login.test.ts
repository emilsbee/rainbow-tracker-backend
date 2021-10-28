// External imports
import request from "supertest"

// Internal imports
import server from "../../../index"
import {initialize} from "../../../tests/helpers";
import redisClient from "../../../db/redis";
import {testBadUser, testUser} from "../../../tests/test-data";
import {SESSION_COOKIE_NAME} from "../../../middleware/session";

beforeAll(async () => {
    await initialize()
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