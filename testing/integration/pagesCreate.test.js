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

// @route       /api/pages/register
// @desc        when hit the router will create a new page for a Professional
// @NOTE:       TEST CLAIMS TO FAIL, HOWEVER, WHEN MONGO IS CHECKED THERE IS A NEW PAGE CREATED!
test("Creates a new page for the User", async () => {
    let cookie = await login();
    response = await request(app)
        .post("/api/pages/create")
        .set("cookie", cookie)
        .field("pageHandle", "MD FITNESS")
        .field("pageTitle", "MD Fitness")
        .field("pageAbout", "All things fitness!")
        .attach("image", null)
        .expect(200);
})