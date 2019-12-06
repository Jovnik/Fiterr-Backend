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
      const user = await User.findOne({email: email})
      if (!user) { return done(null, false, {message: "Email Not Registered"}) }

      // If user matches
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) { return done(null, user) }
      else {
        return done(null, false, {message: 'Password Incorrect'})
      }
    }
    catch(err) {
      console.log(err)
    }
    
  })
)

passport.serializeUser((user, done) => {
  console.log(user)
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

module.exports = passport