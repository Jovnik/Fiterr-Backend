const express = require('express');
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
require('dotenv').config();

const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.use(express.json());

// express session 
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: "cookieSessions"
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  }),
)

//cors 
app.use(cors({
  origin: process.env.CORS_URL,
  credentials: true
}))

// passport
const passport = require('./initializers/passport');
app.use(passport.initialize());
app.use(passport.session());    // for persistent login sessions

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/services', require('./routes/services'));
app.use('/api/session', require('./routes/session'));

module.exports = app

