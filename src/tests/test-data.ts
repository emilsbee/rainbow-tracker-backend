import {User} from "../routes/admin/user";

export const testUser:User = {
    email: "test@test.com",
    password: "password",
    userid: "81823c86-ef44-4885-9933-929ed75e0876",
    salt: ""
}

export const testBadUser:User = {
    email: "fake@fake.fake",
    password: "wrong",
    userid: "fake",
    salt: "none"
}