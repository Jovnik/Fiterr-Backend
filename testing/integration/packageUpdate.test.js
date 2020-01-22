const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const stripe = require('stripe')(process.env.SECRETSTRIPE)

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

// // @desc: login function for future tests.
// // @NOTE: THIS USER LOGIN IS FOR A [ PROFESSIONAL USER ]
const login = async () => {
    const response = await request(app)
        .post("/api/users/login")
        .send({
            receipt_email: "md@gmail.com",
            password: "asdfgh"
        });
    return response.headers["set-cookie"];
};

test("update package", async () => {
    let cookie = await login();
    response = await request(app)
        .put("/api/packages/package-update")
        .set("cookie", cookie)
        .field("id", "5e27defb6cdb97314ab3ff48")
        .field("title", "Weights with MD")
        .field("description", "Learn how to lift with MD")
        .field("numberOfSessions", 5)
        .field("price", 25000)
        .expect(200)
})