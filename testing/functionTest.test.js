const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
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

// // @desc: Registration test: Testing that a user can login through the backend API.
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

// @desc: login function for future tests.
// @NOTE: THIS USER LOGIN IS FOR A [ PROFESSIONAL USER ]
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

// @route       /api/pages/register
// @desc        when hit the router will create a new page for a Professional
// @NOTE:       TEST CLAIMS TO FAIL, HOWEVER, WHEN MONGO IS CHECKED THERE IS A NEW PAGE CREATED!
test("Creates a new package for the page", async () => {
  let cookie = await login();
  response = await request(app)
    .post("/api/pages/register")
    .set("cookie", cookie)
    .send({
      pageTitle: "MD's FITNESS",
      pageAbout: "ALL THINGS FITNESS BABY SKEEEET"
    })
    .expect(200);
})