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

const stripeGenToken = async () => {
    try {
        const token = await stripe.tokens.create(
            {
                card: {
                    number: '4242424242424242',
                    exp_month: 1,
                    exp_year: 2021,
                    cvc: '314',
                }
            })
        return token
    } catch (err) {
        console.log(err.message);
    }
}

// @route       /api/professional/:packageId
// @desc        will purchase a package for an enthusiast 
test("purchase a package using stripe and create a service", async () => {
    const token = await stripeGenToken();
    let cookie = await login();
    response = await request(app)
        .post('/api/packages/MDFITNESS/Cardio')
        .set("cookie", cookie)
        .send({
            receipt_email: "customer1@email.com",
            source: token.id
        })
})