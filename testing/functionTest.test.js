// const {
//     createPost
// } = require('../routes/userPosts')

const request = require("supertest");
const app = require("../app");
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

afterEach(() => {
  mongoose.connection.close();
});

// @desc: Registration test: Testing that a user can login through the backend API.
// test("registration test", async () => {
//   await request(app)
//     .post("/api/users/register")
//     .send({
//       firstname: "william",
//       lastname: "johnson",
//       email: "williamjohnson@gmail.com",
//       username: "willyJohnson",
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

// @desc: login function for future tests.
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

// @route /api/users/professional-activate
// @desc: Testing that when route is hit the users isProfessional is switched to True
test("switches user to professional once phone number is entered [SHOULD PASS]", async () => {
  let cookie = await login();
  response = await request(app)
    .post("/api/users/professional-activate")
    .set("cookie", cookie)
    .send({
      phoneNumber: "0412345178"
    })
    .expect(200);
});
