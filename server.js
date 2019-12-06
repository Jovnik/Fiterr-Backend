const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const morgan = require('morgan');

const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

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
  credentials:true 
}))

// passport
const passport = require('./initializers/passport');
app.use(passport.initialize());
app.use(passport.session());    // for persistent login sessions

// Routes
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => console.log(`Now listening on port ${PORT} ✔️`));

