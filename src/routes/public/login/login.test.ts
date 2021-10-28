// External imports
import request from "supertest"

// Internal imports
import server from "../../../index"
import {initialize} from "../../../tests/helpers";
import redisClient from "../../../db/redis";
import {testBadUser, testUser} from "../../../tests/test-data";


beforeAll(async () => {
    await initialize()
})

describe("Route /auth/login tests", () => {
    test("Should successfully login user with correct credentials", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({email: testUser.email, password: testUser.password})

        expect(response.statusCode).toBe(200)

        expect(response.body).toMatchObject(    {
            userid: "81823c86-ef44-4885-9933-929ed75e0876",
            email: "test@test.com"
        })
    })

    test("Should fail to login user with bad credentials", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({email: testBadUser.email, password: testBadUser.password})

        expect(response.statusCode).toBe(401)
    })

    test("Should fail to login user with wrong request body", async () => {
        const response = await request(server).post("/api/auth/login").set('content-type',  'application/json').send({username: testBadUser.email, pass: testBadUser.password, userid: testBadUser.userid})

        expect(response.statusCode).toBe(401)
    })

    test("Should fail to login user with request body being a string and not a JSON object", async () => {
        const response = await request(server).post("/api/auth/login").send("something")

        expect(response.statusCode).toBe(415)
    })
})

afterAll(async() => {
    await server.close()
    await redisClient.quit()
})