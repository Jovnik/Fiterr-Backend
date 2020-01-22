const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const stripe = require('stripe')(process.env.SECRETSTRIPE)
let cookie = null;

beforeEach(() => {
    dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    mongoose.connect(
        "mongodb://localhost:27017/fiterr-test-db",
        dbOptions,
        err => {
            if (err) {
                // console.log("not connected");
            } else {
                // console.log("connected");
            }
        }
    );
});

// @desc: logout function for future tests.
const logout = async () => {
    response = await request(app)
        .post("/api/users/logout")
};

afterEach(() => {
    logout()
    mongoose.connection.close();
});

// @route: /api/users/register
// @desc: Registration test: Testing that a user can login through the backend API.
test("registration test", async () => {
    const response = await request(app)
        .post("/api/users/register")
        .send({
            firstname: "Craig version 3",
            lastname: "Stanley",
            email: "craig.stanleyV13@gmail.com",
            username: "craig.stanleyV5",
            password: "asdfgh",
            gender: "Male",
            dob: new Date()
        })
        .expect(200);
    expect(response.text).toBeTruthy()
    const result = JSON.parse(response.text)
    expect(result.isProfessional).toBe(false)
});