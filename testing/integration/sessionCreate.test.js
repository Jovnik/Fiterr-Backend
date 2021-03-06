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

// @route:      /api/professional/:pageHandle/:serviceId
// @desc        creates a session for the user
test("create a session for a service", async () => {
    let cookie = await login();
    response = await request(app)
        .post('/api/sessions/session-create')
        .set("cookie", cookie)
        .field("serviceID", "5e27e3bc7ac2f932b16920d6")
        .field("time", "12:00")
        .field("date", Date.now())
        .field("location", "Caufield")
        .expect(200)
})