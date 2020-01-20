const express = require('express');
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const stripe = require('stripe')(process.env.SECRETSTRIPE)
require('dotenv').config();

const morgan = require('morgan');

const app = express();




app.use(morgan('dev'));

app.use(express.json());

// express session 
app.use(
  session({
    secret: 'sessionsecret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  }),
)

//cors 
app.use(cors({
  origin: "http://localhost:3000",
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
app.use('/api/professional', require('./routes/professional'));
app.use('/api/pages', require('./routes/pages'));

module.exports = app

