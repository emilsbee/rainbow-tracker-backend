// External imports
import request from "supertest"

// Internal imports
import app from "../index"
import redisClient from "../db/redis";
import {initialize} from "./helpers";

beforeAll(async () => {
    await initialize()
})

describe("Test the root path", () => {
    test("It should respond with 200 for GET", async () => {
        const response = await request(app).get("/")
        expect(response.statusCode).toBe(200)
    })
})

describe("Test the auth routes", () => {
    test("It should successfully login user", async () => {
        const response = await request(app).post("/api/auth/login").set('content-type',  'application/json').send({email: "test@test.com", password: "password"})

        expect(response.statusCode).toBe(200)

        expect(response.body.length).toBe(1)
        expect(response.body[0]).toMatchObject(    {
            userid: "81823c86-ef44-4885-9933-929ed75e0876",
            email: "test@test.com"
        })
    })
})

afterAll(() => {
    return redisClient.quit()
})