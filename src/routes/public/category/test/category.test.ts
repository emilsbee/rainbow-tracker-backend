// External imports
import request from "supertest"
import fs from "fs"

// Internal imports
import server from "../../../../index"
import {initialize, initializeWithData} from "../../../../tests/helpers";
import redisClient from "../../../../db/redis";
import {User} from "../../../admin/user";
import {Week} from "../../week/week";

const testUser:User = {
    email: "test@test.com",
    password: "password",
    userid: "81823c86-ef44-4885-9933-929ed75e0876",
    salt: "6c605af47e13bf6b51bd3b6bc0b26eff"
}

const testBadUser:User = {
    email: "fake@fake.fake",
    password: "wrong",
    userid: "fake",
    salt: "none"
}

// const testWeek:Week = {userid: testUser.userid, weekNr: 43, weekYear: 2021, weekid: "0752071f-d68b-49a4-877f-80f19e2f31d8"}

// const dataToPopulate = fs.readFileSync("./testData.sql").toString()

beforeAll(async () => {
    // await initialize()
    // await initializeWithData(dataToPopulate)
})

describe("Route /week/:weekid/day/:day/categories", () => {
    test("It should successfully return update week day's categories", async () => {
        const response = request(server).patch(``)
    })
})

afterAll(async() => {
    await server.close()
    await redisClient.quit()
})