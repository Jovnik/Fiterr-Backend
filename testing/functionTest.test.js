const request = require("supertest");
const app = require("../app.js");
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

// @desc: Registration test: Testing that a user can login through the backend API.
// test("registration test", async () => {
//   await request(app)
//     .post("/api/users/register")
//     .send({
//       firstname: "m",
//       lastname: "d",
//       email: "md@email.com",
//       username: "md",
//       password: "asdfgh",
//       gender: "Male",
//       dob: new Date()
//     })
//     .expect(200, body => {
//       console.log(body);
//     });
// });

// // @desc: Test of login function. Ensure that a user can login through the backend API.
// test("login test", async () => {
//   const response = await request(app)
//     .post("/api/users/login")
//     .send({
//       email: "md@email.com",
//       password: "asdfgh"
//     });
// });

// // @desc: login function for future tests.
// // @NOTE: THIS USER LOGIN IS FOR A [ NON-PROFESSIONAL USER ]
// const login = async () => {
//   const response = await request(app)
//     .post("/api/users/login")
//     .send({
//       email: "williamjohnson@gmail.com",
//       password: "asdfgh"
//     });
//   return response.headers["set-cookie"];
// };

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

// // @desc: Testing that a user can create a post through the backend API.
// // @route       /api/posts/create-post
// test("creates a post for the user", async () => {
//   let cookie = await login();
//   const response = await request(app)
//     .post("/api/posts/create-post")
//     .set("cookie", cookie)
//     .field("postTitle", "THIS IS A POST TITLE")
//     .field("postDescription", "THIS IS A POST DESCRIPTION")
//     .attach("image", "testing/test_images/blueCloth.jpg")
//     .then(response => {
//       console.log(response.text);
//       expect(response.text).toBeTruthy();
//     });
// });

// // @route /api/users/professional-activate
// // @desc: Testing that when route is hit the users isProfessional is switched to True
// test("switches user to professional once phone number is entered [SHOULD FAIL]", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .post("/api/users/professional-activate")
//     .set("cookie", cookie)
//     .send({
//       phoneNumber: "04123451178"
//     })
//     .then(response => {
//       console.log(response.text);
//       expect(response.text).toBeTruthy();
//     })
// });

// // @route /api/users/professional-activate
// // @desc: Testing that when route is hit the users isProfessional is switched to True
// test("switches user to professional once phone number is entered [SHOULD PASS]", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .post("/api/users/professional-activate")
//     .set("cookie", cookie)
//     .send({
//       phoneNumber: "0412345178"
//     })
//     .expect(200);
// });

// // @route       /api/pages/register
// // @desc        when hit the router will create a new page for a Professional
// // @NOTE:       TEST CLAIMS TO FAIL, HOWEVER, WHEN MONGO IS CHECKED THERE IS A NEW PAGE CREATED!
// test("Creates a new page for the User", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .post("/api/pages/create")
//     .set("cookie", cookie)
//     .field("pageHandle", "MD FITNESS")
//     .field("pageTitle", "MD Fitness")
//     .field("pageAbout", "All things fitness!")
//     .attach("image", null)
//     .expect(200);
// })

// test("delete a page for the user", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .delete("/api/pages/delete")
//     .set("cookie", cookie)
//     .expect(200)
// })

// @route       /api/professional/package-register
// @desc        when hit the router will create a new package for the page
// test("Creates a new package for a page", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .post("/api/professional/package-register")
//     .set("cookie", cookie)
//     .send({
//       title: "Cardio",
//       description: "get your heart racing with MD",
//       numSessions: 3,
//       price: 219.99
//     })
//     .expect(200)
// })

// // @route       /api/professional/package-view
// // @desc        will display all the packages from one page
// test("view packages created by a user", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .get("/api/professional/MDFITNESS")
//     .set("cookie", cookie)
//     .then(res => {

//     })
// })

// // @route       /api/professional/package-view
// // @desc        will display one of the packages from one page
// test("view packages created by a user", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .get("/api/professional/MDFITNESS/Cardio")
//     .set("cookie", cookie)
//     .then(res => {

//     })
// })


// test("update package", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .put("/api/professional/update/Cardio")
//     .set("cookie", cookie)
//     .send({
//       price: 21900
//     })
//     .expect(200)
// })

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
test("purchase a package using stripe", async () => {
  const token = await stripeGenToken();
  let cookie = await login();
  response = await request(app)
    .post('/api/professional/MDFITNESS/Cardio')
    .set("cookie", cookie)
    .send({
      stripeEmail: "customer1@email.com",
      stripeToken: token.id
    })
})


// @route       /api/professional/service-register
// @desc        when hit router will create a new service for a group of packages
// test("creates a service once a package has been purchased", async () => {
//   let cookie = await login();
//   response = await request(app)
//     .post("/api/professional/service-register")
//     .set("cookie", cookie)
//     .query('packageId=5e229785b2d64e23f3d7e706')
//     .sortQuery()
//     .send({
//       packageId: "5e229785b2d64e23f3d7e706"
//     })
//     .expect(200)

// })