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
            email: "md@gmail.com",
            password: "asdfgh"
        });
    return response.headers["set-cookie"];
};

// @route       /api/professional/package-register
// @desc        when hit the router will create a new package for the page
test("Creates a new package for a page", async () => {
    let cookie = await login();
    response = await request(app)
        .post("/api/packages/package-register")
        .set("cookie", cookie)
        .send({
            pageID: "5e27de08f64e5330f38bbbf4",
            title: "Cardio",
            description: " get your heart racing with MD",
            numberOfSessions: 3,
            price: 21999
        })
        .expect(200)
})