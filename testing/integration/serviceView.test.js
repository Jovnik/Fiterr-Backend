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


test("view services related to one enthusiast", async () => {
    let cookie = await login();
    response = await request(app)
        .get("/api/services/view-services")
        .set("cookie", cookie)
        .then(res => {
            console.log(res.text);
        })
})