const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

// models
const User = require('../models/User')

const validPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

passport.use(
  new LocalStrategy(function(email, password, done) {
    User.findOne({ email }, async function(err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' })
      }
      const checkPassword = await validPassword(password, user.password)
      if (!checkPassword) {
        return done(null, false, { message: 'Incorrect password.' })
      }
      return done(null, user)
    })
  }),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

module.exports = passport