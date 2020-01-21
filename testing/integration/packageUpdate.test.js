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

// // @desc: login function for future tests.
// // @NOTE: THIS USER LOGIN IS FOR A [ PROFESSIONAL USER ]
const login = async () => {
    const response = await request(app)
        .post("/api/users/login")
        .send({
            email: "md@email.com",
            password: "asdfgh"
        });
    return response.headers["set-cookie"];
};

test("update package", async () => {
    let cookie = await login();
    response = await request(app)
        .put("/api/professional/update/Cardio")
        .set("cookie", cookie)
        .send({
            price: 21900
        })
        .expect(200)
})