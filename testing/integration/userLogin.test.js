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



// @desc: Test of login function. Ensure that a user can login through the backend API.
test("login test", async () => {
    const response = await request(app)
        .post("/api/users/login")
        .send({
            email: "jj@email.com",
            password: "asdfgh"
        });
});