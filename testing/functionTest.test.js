// const {
//     createPost
// } = require('../routes/userPosts')

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
let cookie = null

beforeEach(() => {
    dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    mongoose.connect("mongodb://localhost:27017/fiterr-test-db", dbOptions, (err) => {
        if (err) {
            console.log('not connected')
        } else {
            console.log('connected')
        }
    })
})

afterEach(() => {
    mongoose.connection.close()
})

test("registration test", async () => {
    await request(app)
    .post('/api/users/register')
    .send({
        firstname: "john",
        lastname: "smith",
        email: "johnsmith@email.com",
        username: "johnSmith",
        password: "asdfgh",
        gender: "Male",
        dob: new Date(),
    })
    .expect(200, (body) => {
        console.log(body);
    })
})

test("login test", async () => {
    const response = await request(app)
    .post('/api/users/login')
    .send({ email: "md@email.com", password:'asdfgh' })
    return response.headers['set-cookie']
})

test("creates a post for the user", async () => {
    const response = await request(app)
        .post('/api/newsfeed/create-post')
        .set('cookie', cookie)
        .send({
            owningUser: req.user.id,
            title: "Post title",
            content: "lorem epsom asdf ;ahdsfkjb dajskdf "
        })
    
})