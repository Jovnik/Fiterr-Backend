const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

// models
const User = require('../models/User')

// const validPassword = async (password, hash) => {
//   return await bcrypt.compare(password, hash)
// }

passport.use(
  new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
      const user = await User.findOne({ email })

      if (!user) { return done(null, false, {message: 'Email is not registered'}) }

      // If user matches
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) { return done(null, user) }
      else {
        return done(null, false, {message: 'Password is invalid'})
      }
    }
    catch(err) {
      console.log(err)
      return done(err);    
    }
  })
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

module.exports = passport