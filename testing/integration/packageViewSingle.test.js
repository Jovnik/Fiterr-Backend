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


// @route       /api/professional/package-view
// @desc        will display one of the packages from one page
test("view packages created by a user", async () => {
    let cookie = await login();
    response = await request(app)
        .get("/api/packages/MDFITNESS/Cardio")
        .set("cookie", cookie)
        .then(res => {
            console.log(res.text);
        })
})
