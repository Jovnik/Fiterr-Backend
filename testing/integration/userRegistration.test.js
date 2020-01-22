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
                console.log(err);
            } else {
            }
        }
    );
});

afterEach(() => {
    mongoose.connection.close();
});

// @route:      /api/users/register
// @desc:       Registration test: Testing that a user can login through the backend API.

// @NOTES:      Test Passed!
test("registration test", async () => {
    const response = await request(app)
        .post("/api/users/register")
        .send({
            firstname: "M",
            lastname: "D",
            email: "md@gmail.com",
            username: "md",
            password: "asdfgh",
            gender: "Male",
            dob: new Date()
        })
        .expect(200);
    expect(response.text).toBeTruthy()
    const result = JSON.parse(response.text)
    expect(result.isProfessional).toBe(false)
});